import { Component, _decorator } from "cc";

const { ccclass, executionOrder, property } = _decorator;

/*
 * @Author: yanmingjie0223@qq.com
 * @Date: 2019-01-09 15:05:01
 * @Last Modified by: checong.brainy
 * @Last Modified time: 2021-07-31 10:50:22
 */
@ccclass("AppEntry")
@executionOrder(-1)
export class AppEntry extends Component {

	// static needPreloadAd: boolean = true;
	// private _connectCount: number = 0;//断线重连次数
	// private _isConnectTime: number = 0;//短线重连请求间隔时间
	// private _disconnectCode: number = 0; // 1000 账号异常 1001 被挤下线

	protected onLoad(): void {
		// if(Global.gameMode==EGameMode.Normal){
		// 	Global.gameMode = App.getLaunchArg("gameMode",0);
		// }

		// const showFPS =  App.getLaunchArg("showFPS",false);
		// showFPS ? profiler.showStats():profiler.hideStats();

		// if (Global.gameMode==EGameMode.BattleTest) {
		// 	Global.levelId = Global.chapterId = 1;

		// 	BattleManager.getInstance().enterOffline(999, (err) => { });
		// 	return;
		// }
		// else if(Global.gameMode==EGameMode.Performance){
		// 	const level =  1;
		// 	Global.levelId = Global.chapterId = 1;
		// 	const mapId = level;

		// 	BattleManager.getInstance().enterOffline(mapId, err => {

		// 		//Object.keys(hero.abilitys).forEach(name => hero.abandonAbilityByName(name));

		// 		// 放弃主炮、放弃副炮、放弃SE、替换装甲技能
		// 		// const ability = hero.abilitys[301];
		// 		// const seAblility = hero.abilitys[601];
		// 		// const ammorAblility = hero.abilitys['$noBullet14001'];
		// 		// hero.abandonAbility(seAblility);
		// 		// hero.abandonAbility(ability);
		// 		// hero.abandonAbility(ammorAblility);
		// 		// hero.learnAbilityById(93001);
		// 		// hero.learnAbilityById(5);
		// 	});
		// 	return;
		// }

		// BattleManager.getInstance().clearAll();

		// if(AppEntry.needPreloadAd && AppConfig.adRewardVideoCodeId && AppConfig.adRewardVideoCodeId.length>0){
		// 	sdk.getInstance().showRewardedVideoAd(AppConfig.adRewardVideoCodeId,{loadOnly:1},{
		// 		onError: (err: Error) => {
		// 			console.log("Preload RewardedVideoAd onError", err);
		// 		}
		// 	})
		// 	AppEntry.needPreloadAd = false;
		// }

		// const loginModel = ModelManager.getInstance().getModel(LoginModel) as LoginModel;

		// if (loginModel.isConnectionAvailable()) {
		// 	console.log("AppEntry: isConnectionAvailable true");
		// 	return;
		// }
		// loginModel.clear();
		// let logininfo;
        // try {
        //     const loginInfoStr = sys.localStorage.getItem('tank_login_info') as string;
        //     if(loginInfoStr && loginInfoStr.length > 0){
        //         logininfo= JSON.parse(loginInfoStr);
        //     }
        // } catch (error) {
        //     console.log("parse json error",error);
        // }
		// if(loginModel.isAutoLogin && logininfo && logininfo.loginCode && logininfo.loginCode !="")
		// {
		// 	loginModel.showLogin();
		// }
		// else
		// {
		// 	ViewManager.getInstance().show(null, LoginModel, LoginView, null, ViewShowType.MULTI_VIEW, null, (view: LoginView) => {
		// 		const versonText = `v${AppConfig.version} (${AppConfig.hash})`;
		// 		view.setVersion(versonText);
		// 	});
		// }

		// EventManager.getInstance().addOnceEventListener(GameEvents.OnGameSrvConnected, this.onConnected, this);
	}

	private onConnected(): void {
		this.onGameSrvConnected();
	}

	start() {
		//AudioManager.getInstance().playMusic("music/mainBG", true);
	}

	protected onGameSrvConnected() {
		// this.addEvents();
		// const gameModel = ModelManager.getInstance().getModel(GameModel) as GameModel;
		// gameModel.initOk();
	}

	addEvents() {
		// EventManager.getInstance().addOnceEventListener(GameEvents.OnGameSrvDisconnected, () => {
		// 	console.log("===>AppEntity: socket closed");
		// 	// const args = {
		// 	// 	title: "提示",
		// 	// 	question: "您已断线，请从新登录！",
		// 	// 	onYes: () => {
		// 	// 		this.restartGame();
		// 	// 	}
		// 	// };
		// 	// PopupManager.getInstance<PopupManager>().showPopup(PopupType.yesOrNo, args);
		// 	this._connectCount=1;
		// 	this._isConnectTime=1;
		// 	BattleManager.getInstance().pause();
		// 	if(this._disconnectCode === 1001)
		// 	{
		// 		const args = {
		// 			title: "提示",
		// 			question: "您的账号在其他地方登录，是否需要重新链接？",
		// 			onYes: () => {
		// 				this._connectCount = 10;
		// 				this._disconnectCode = 0;
		// 				this.connectLG();
		// 			}
		// 		};
		// 		PopupManager.getInstance<PopupManager>().showPopup(PopupType.yesOrNo, args);
		// 	}
		// 	else
		// 	{
		// 		const args = {
		// 			question: "您的网络已断开。",
		// 		};
		// 		PopupManager.getInstance<PopupManager>().showPopup(PopupType.popup_connect, args);
		// 		this.connectLG();
		// 	}
		// }, this);

		// EventManager.getInstance().addEventListener(GameEvents.OnRequestStart, () => {
		// 	LoadingManager.getInstance().show();
		// }, this);

		// EventManager.getInstance().addEventListener(GameEvents.OnRequestEnd, () => {
		// 	LoadingManager.getInstance().closeAll();
		// }, this);


		// EventManager.getInstance().addEventListener(GameEvents.OnRequestTimeout, () => {
		// 	const args = {
		// 		title: "错误",
		// 		question: "请求超时是否重试?",
		// 		onYes: () => {
		// 			SocketManager.getInstance().retryLastRequest();
		// 		},
		// 		onNo: () => {
		// 			LoadingManager.getInstance().close();
		// 		}
		// 	};
		// 	PopupManager.getInstance<PopupManager>().showPopup(PopupType.yesOrNo, args);
		// }, this);

		// EventManager.getInstance().addEventListener(GameEvents.onGameSrvConnectError, (data:[number,string]) => {
		// 	const [code, reason] = data;
		// 	this._disconnectCode = code;
		// })

		// EventManager.getInstance().addOnceEventListener(GameEvents.OnPlatformLogout, () => {
		// 	console.log("===>OnPlatformLogout");
		// 	this.restartGame();
		// }, this);

		// EventManager.getInstance().addOnceEventListener(GameEvents.OnGamePanic, (err: string) => {
		// 	console.log("===>OnGamePanic",err);
		// 	const args = {
		// 		title: "错误",
		// 		question: err,
		// 		onYes: () => {
		// 			this.restartGame();
		// 		},
		// 	};
		// 	PopupManager.getInstance<PopupManager>().showPopup(PopupType.yesOrNo, args);

		// }, this);
	}

	removeEvents() {
		// EventManager.getInstance().removeAll(this);
	}

	// protected restartGame() {
	// 	this.removeEvents();
	// 	BattleManager.getInstance().clearAll();
	// 	DropSystem.getInstance().clear();
	// 	ViewManager.getInstance().closeAll();
	// 	LoadingManager.getInstance().show();
	// 	SocketManager.getInstance().closeServer();
	// 	const checkSocketClose = () => {
	// 		if (!SocketManager.getInstance().isActive(SocketType.LG)) {
	// 			this.unschedule(checkSocketClose);
	// 			director.loadScene("Main", (err, scene) => {
	// 				if (err) {
	// 					console.error("restartGame ", err);
	// 				}
	// 				LoadingManager.getInstance().close();
	// 			});
	// 			return;
	// 		} else {
	// 			SocketManager.getInstance().closeServer();
	// 		}
	// 	}
	// 	this.schedule(checkSocketClose, 0.1)
	// }


	// protected connectLG() {

	// 	const callback = function()
	// 	{
	// 		const view = ViewManager.getInstance().getView(ConnectPopupView);
	// 		if (view) {
	// 			view.setTitle("断线重连中.....");
	// 		}
	// 		const loginModel = ModelManager.getInstance().getModel<LoginModel>(LoginModel);
	// 		loginModel.connectLG().then(
	// 			(res)=>{
	// 				console.log(res);
	// 				if(view)
	// 				{
	// 					view.closeView();
	// 				}
	// 				BattleManager.getInstance().resume();
	// 				this.addEvents();
	// 				loginModel.onScoketPing();
	// 				this._disconnectCode = 0;
	// 			}
	// 		).catch(
	// 			(err)=>{
	// 				console.log(err);
	// 				if(this._connectCount <10)
	// 				{
	// 					this._isConnectTime*=2;
	// 					this.connectLG();
	// 				}
	// 				else
	// 				{
	// 					const args = {
	// 						title: "提示",
	// 						question: "您已断线，请从新登录！",
	// 						onYes: () => {
	// 							this.restartGame();
	// 						}
	// 					};
	// 					PopupManager.getInstance<PopupManager>().showPopup(PopupType.yesOrNo, args);
	// 				}
	// 				this._connectCount++;

	// 			}
	// 		);
	// 	}
	// 	console.log("this.isConnectTime ...........................", this._connectCount,"     ",this._isConnectTime);

	// 	this.scheduleOnce(callback, this._isConnectTime);
	// }
}