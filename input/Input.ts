
import { Component, EventKeyboard, EventMouse, macro, systemEvent, SystemEventType, Vec2, _decorator } from 'cc';
import { InputAxis } from './InputAxis';
const { ccclass, property ,executionOrder } = _decorator;


@ccclass('Input')
@executionOrder(-1)
export class Input extends Component {

    _keyStatus = {};
    _mouseStatus = {};

    _mouseOrTouchDelta = new Vec2();

    _mouseScrollDelta = new Vec2();

    _mouseMovement = new Vec2();

    _joystickPos : Vec2[] = new Array<Vec2>();

    _axisList = new Array<InputAxis>();

    _delteTime = 0.0;

    static _instance:Input  = null;
    static get instance() {
        return Input._instance;
    }

    onLoad(){
        Input._instance = this;

        //键盘监听
        systemEvent.on(SystemEventType.KEY_UP,this.onKeyUp,this);
        systemEvent.on(SystemEventType.KEY_DOWN,this.onKeyDown,this);

        //鼠标监听
        this.node.on(SystemEventType.MOUSE_WHEEL,this.onMouseScroll,this);
        systemEvent.on(SystemEventType.MOUSE_UP, this.onMouseUp, this);
        systemEvent.on(SystemEventType.MOUSE_DOWN, this.onMouseDown, this);
        systemEvent.on(SystemEventType.MOUSE_MOVE,this.onMouseMove,this);


        //触摸监听
        //systemEvent.on(SystemEventType.TOUCH_MOVE,this.onTouchMove.bind(this));

        this._joystickPos.push(new Vec2(0));
        this._joystickPos.push(new Vec2(0));

        const mouseX = new InputAxis("Mouse X");
        mouseX.MakeMouse(0);
        const mouseY = new InputAxis("Mouse Y");
        mouseY.MakeMouse(1);
        const mouseW = new InputAxis("Mouse ScrollWheel");
        mouseW.MakeMouse(2);
        this._axisList.push(mouseX);
        this._axisList.push(mouseY);
        this._axisList.push(mouseW);

        const horAxis = new InputAxis ("Horizontal");
        horAxis.MakeAnalogKey(macro.KEY.right,macro.KEY.left, macro.KEY.d, macro.KEY.a);
        const verAxis = new InputAxis ("Vertical");
        verAxis.MakeAnalogKey (macro.KEY.up,macro.KEY.down, macro.KEY.w, macro.KEY.s);
        this._axisList.push(horAxis);
        this._axisList.push(verAxis);

        // if(sys.isBrowser || sys.isMobile){

        // }
        const horAxisJoystick = new InputAxis ("Horizontal");
        horAxisJoystick.MakeJoystick(0);
        const verAxisJoystick = new InputAxis ("Vertical");
        verAxisJoystick.MakeJoystick (1);
        this._axisList.push(horAxisJoystick);
        this._axisList.push(verAxisJoystick);
    }

    onKeyDown(event:EventKeyboard){
        this._keyStatus[event.keyCode] = true;
    }


    onKeyUp(event:EventKeyboard){
        this._keyStatus[event.keyCode] = false;
    }

    onMouseDown(event:EventMouse) {
        this._mouseStatus[event.getButton()] = true;
        this._mouseOrTouchDelta.x = event.getDeltaX();
        this._mouseOrTouchDelta.y = event.getDeltaY();
    }

    onMouseUp(event:EventMouse){
        this._mouseStatus[event.getButton()] = false;
        this._mouseOrTouchDelta.x = event.getDeltaX();
        this._mouseOrTouchDelta.y = event.getDeltaY();
    }

    onMouseMove(event:EventMouse){
        this._mouseOrTouchDelta.x = event.getDeltaX();
        this._mouseOrTouchDelta.y = event.getDeltaY();
    }

    onMouseScroll(event:EventMouse){
        this._mouseScrollDelta.x = event.getScrollX();
        this._mouseScrollDelta.y = event.getScrollY();
    }

    // onTouchMove(event: EventTouch){
    //     this._mouseOrTouchDelta.set(event.getDelta());
    //     this._mouseOrTouchDelta.set(event.getDelta());
    //     const touchs = event.getAllTouches();
    //     if(touchs.length == 2){
    //         const ta = touchs[0];
    //         const tb = touchs[1];
    //         const pa = ta.getPreviousLocation();
    //         const pb = tb.getPreviousLocation();
    //         const delta = Vec2.distance(ta.getLocation(),tb.getLocation()) - Vec2.distance(pa,pb);
    //         this._mouseScrollDelta.y = delta;
    //     }
    // }

    // onTouchStart(event: EventTouch){
    // }

    // onTouchEnd(event: EventTouch){
    // }

    onJoyStickStart(index:number){

    }

    onJoyStickMove(index:number,horizontal:number,vertical:number){
        this.SetJoystickPosition(index,horizontal,vertical);
    }

    onJoyStickEnd(index:number){
        this.SetJoystickPosition(index,0,0);
    }

    lateUpdate(){
        this._mouseOrTouchDelta.x = 0;
        this._mouseOrTouchDelta.y = 0;
        this._mouseScrollDelta.x = 0;
        this._mouseScrollDelta.y = 0;
    }

    update(delteTime){
        this._delteTime = delteTime;

        this._axisList.forEach(element => {
            element.update(this,delteTime);
        });
    }

    public get mouseDelta(){
        return this._mouseOrTouchDelta;
    }

    public get mouseScrollDelta(){
        return this._mouseScrollDelta;
    }

    public GetAxis(axis:string){
        let finalValue = 0;
        for (const element of this._axisList) {
            if(element.name==axis && Math.abs(element.value) > Math.abs(finalValue)){
                finalValue = element.value;
                break;
            }
        }
        return finalValue;
    }

    public GetAxisRaw(axis:string){
        let finalValue = 0;
        for (const element of this._axisList) {
            if(element.name==axis && Math.abs(element.valueRaw) > Math.abs(finalValue)){
                finalValue = element.valueRaw;
                break;
            }
        }
        return finalValue;
    }

    public GetKey(keycode:number){
        if(keycode in this._keyStatus){
            return this._keyStatus[keycode];
        }
        else{
            return false;
        }
    }

    public GetJoystickPosition(index:number,axis:number)
    {
        const pos = this._joystickPos[index] || Vec2.ZERO;
        return axis==0?pos.x:pos.y
    }

    public SetJoystickPosition(index : number,x:number,y:number){
        this._joystickPos[index].x = x;
        this._joystickPos[index].y = y;
    }

}
