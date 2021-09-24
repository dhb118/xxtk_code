import { AudioSource, Component, director, game, Label, Sprite, tween, _decorator } from 'cc';
import { GRoot } from 'fairygui-cc';
import TimeManager from './manager/TimeManager';
const { ccclass, property} = _decorator;

@ccclass('UIRoot')
export class UIRoot extends Component {
    static _instance : UIRoot|null = null;
    static get instance(){
        return UIRoot._instance;
    }

    @property({type:Sprite})
    public fadeSprite: Sprite = null;

    @property({type:Label})
    public fadeLabel: Label = null;

    private _musicSource:AudioSource|null = null;

    public get musicSource(){
        if(!this._musicSource){
            this._musicSource = this.node.addComponent(AudioSource);
        }
        return this._musicSource;
    }


    public fadeOut(duration:number,func?:Function){
        const sp = this.fadeSprite;
        if(sp){
            const t = tween({alpha:255});
            t.to(duration , {alpha:0}, {
                easing: 'linear',
                onStart: () => {
                    sp.enabled = true;
                    sp.node.setSiblingIndex(-1);
                    sp.color.set(0,0,0,255);
                },
                onUpdate: (target:{alpha:number}) => {
                    sp.color.set(0,0,0,target.alpha);
                },
                onComplete:()=>{
                    func && func();
                    sp.enabled = false;
                }
            });
            t.start();
        }else{
            func && func();
        }
    }

    public setFadeString(str:string){
        if(this.fadeLabel){
            this.fadeLabel.string = str;
            this.fadeLabel.enabled = str.length>0;
            this.fadeLabel.node.setSiblingIndex(-1);
        }
    }

    public fadeIn(duration:number,func?:Function){
        const sp = this.fadeSprite;
        if(sp){
            const t = tween({alpha:0});
            t.to(duration , {alpha:255}, {
                easing: 'linear',
                onStart: () => {
                    sp.enabled = true;
                    sp.node.setSiblingIndex(-1);
                    sp.color.set(0,0,0,0);
                },
                onUpdate: (target:{alpha:number}) => {
                    sp.color.set(0,0,0,target.alpha);
                },
                onComplete:()=>{
                    func && func();
                }
            });
            t.start();
        }else{
            func && func();
        }
    }

    public fadeToScene(sceneName:string,cb?:Function){
        this.fadeIn(0.5,()=>{
            director.loadScene(sceneName,()=>{
                this.fadeOut(0.5,cb);
            });
        })
    }

    onLoad(){
        UIRoot._instance = this;
        GRoot.create();
        game.addPersistRootNode(this.node);
        GRoot.inst.node.parent = this.node as any;

    }

    update (dt: number) {
        TimeManager.getInstance().onUpdate(dt);
    }

}
