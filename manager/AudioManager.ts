import { AudioClip, AudioSource, Game, game, resources } from "cc";
import * as fgui from "fairygui-cc";
import { UIRoot } from "../UIRoot";

export class AudioManager {

    private static _instance: AudioManager;
	public static getInstance(): AudioManager {
		if (!this._instance) {
			this._instance = new AudioManager();
		}
		return this._instance;
    }

    //总体音效音量[0-1]
    private _soundVolume: number = 1.0;
    public set soundVolume(v: number) {
        this._soundVolume = v;
        fgui.GRoot.inst.volumeScale = v;
        this.soundEnable = (v>0);
    }

    //总体背景音量[0-1]
    private _musicVolume: number = 1.0;
    public set musicVolume(v: number) {
        this._musicVolume = v;
        const player = this.musicPlayer;
        if (player) {
            player.volume = v;
        }
    }

    private _soundEnable: boolean = true;
    public set soundEnable(v: boolean) {
        this._soundEnable = v;
    }
    public get soundEnable(): boolean {
        return this._soundEnable;
    }

    private _musicEnable: boolean = true;
    public set musicEnable(v: boolean) {
        this._musicEnable = v;
        if (v) {
            const player = this.musicPlayer;
            if (player && player.clip) {
                player.play();
            } else if (this._musicUrl.length > 0) {
                this.playMusic(this._musicUrl);
            }
        } else {
            this.pauseMusic();
        }
    }
    public get musicEnable(): boolean {
        return this._musicEnable;
    }

    private _musicUrl: string = "";
    private _isMusicPlaying: boolean = false;
    private _soundPlayers = new Map<string,AudioSource>();

    private get musicPlayer(){
        return UIRoot.instance?.musicSource;
    }

    constructor(){
        game.on(Game.EVENT_HIDE,this._onHide,this);
        game.on(Game.EVENT_SHOW,this._onShow,this);
    }

    _onHide(){
        this.pauseMusic();
    }
    _onShow(){
        this.resumeMusic();
    }

    _playMusic(clip: AudioClip, loop: boolean) {
        if (!this.musicEnable || !clip) return;

        const player = this.musicPlayer;
        if(!player){
            return ;
        }

        this._isMusicPlaying = true;
        player.stop();
        player.clip = clip;
        player.volume = this._musicVolume;
        player.loop = loop;

        if (this._isMusicPlaying) {
            player.play();
        }
    }

    _playSound(clip: AudioClip, loop: boolean) {
        if (!this.soundEnable || !clip) return;
        let player = this._soundPlayers.get(clip._uuid);
        if(!player){
            player = UIRoot.instance.addComponent(AudioSource);
            this._soundPlayers.set(clip._uuid,player);
            player.clip = clip;
            player.volume = this._soundVolume;
        }

        if(!player.playing){
            player.loop = loop;
            player.play();
        }
        // const _this = this;
        // if(player){
        //     player.loop = loop;
        //     player.playOneShot(clip,_this._soundVolume)
        // }
    }

    public playMusic(url: string, loop = true): void {
        this._musicUrl = url;

        const clip = resources.get(url,AudioClip);
        if (clip) {
            this._playMusic(clip, loop);
        } else {
            const self = this;
            resources.load(url, AudioClip, function (err, clip: AudioClip) {
                if (!err) {
                    self._playMusic(clip, loop);
                }
            });
        }
    }

    public stopMusic() {
        const player = this.musicPlayer;
        if (player) {
            player.stop();
        }
        this._isMusicPlaying = false;
    }

    public getPlayingMusicName(){
        const player = this.musicPlayer;
        if (player && player.clip ) {
            return player.clip.name;
        }
        return "";
    }

    public pauseMusic() {
        const player = this.musicPlayer;
        if (player) {
            player.pause();
        }
    }

    public resumeMusic() {
        const player = this.musicPlayer;
        if (player) {
            player.play();
        }
    }

    public playSound(clip:AudioClip, loop = false): void {
        this._playSound(clip, loop);
    }

    playSoundWithUrl(url: string , loop = false){
        const clip = resources.get(url,AudioClip);
        if (clip) {
            this._playSound(clip, loop);
        } else {
            const self = this;
            resources.load(url, AudioClip, function (err, clip: AudioClip) {
                if (!err) {
                    self._playSound(clip, loop);
                }
            });
        }
    }

    public stopSound(url: string) {
        const clip = resources.get(url, AudioClip);
        const player = this._soundPlayers.get(clip._uuid);
        if(player){
            player.stop();
        }
    }

    public clearSounds(cleanup?:boolean){
        this._soundPlayers.forEach((v,k)=>{
            v.stop();
            if(cleanup){
                v.destroy();
            }
        });
        if(cleanup){
            this._soundPlayers.clear();
        }

    }
}
