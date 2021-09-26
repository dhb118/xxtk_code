var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Color, EditBox, _decorator } from "cc";
import { Event as FUIEvent } from "./event/Event";
import { AutoSizeType } from "./FieldTypes";
import { GTextField } from "./GTextField";
import { defaultParser } from "./utils/UBBParser";
const { ccclass } = _decorator;
export class GTextInput extends GTextField {
    constructor() {
        super();
        this._node.name = "GTextInput";
        this._touchDisabled = false;
    }
    createRenderer() {
        this._editBox = this._node.addComponent(MyEditBox);
        this._editBox.maxLength = -1;
        this._editBox["_updateTextLabel"]();
        this._label = this._editBox.textLabel;
        this._node.on('text-changed', this.onTextChanged, this);
        this.on(FUIEvent.TOUCH_END, this.onTouchEnd1, this);
        this.autoSize = AutoSizeType.None;
    }
    set editable(val) {
        this._editBox.enabled = val;
    }
    get editable() {
        return this._editBox.enabled;
    }
    set maxLength(val) {
        if (val == 0)
            val = -1;
        this._editBox.maxLength = val;
    }
    get maxLength() {
        return this._editBox.maxLength;
    }
    set promptText(val) {
        this._promptText = val;
        const newCreate = !this._editBox.placeholderLabel;
        this._editBox["_updatePlaceholderLabel"]();
        if (newCreate)
            this.assignFont(this._editBox.placeholderLabel, this._realFont);
        this._editBox.placeholderLabel.string = defaultParser.parse(this._promptText, true);
        if (defaultParser.lastColor) {
            let c = this._editBox.placeholderLabel.color;
            if (!c)
                c = new Color();
            c.fromHEX(defaultParser.lastColor);
            this.assignFontColor(this._editBox.placeholderLabel, c);
        }
        else
            this.assignFontColor(this._editBox.placeholderLabel, this._color);
        if (defaultParser.lastSize)
            this._editBox.placeholderLabel.fontSize = parseInt(defaultParser.lastSize);
        else
            this._editBox.placeholderLabel.fontSize = this._fontSize;
    }
    get promptText() {
        return this._promptText;
    }
    set restrict(value) {
        //not supported
    }
    get restrict() {
        return "";
    }
    get password() {
        return this._editBox.inputFlag == EditBox.InputFlag.PASSWORD;
        ;
    }
    set password(val) {
        this._editBox.inputFlag = val ? EditBox.InputFlag.PASSWORD : EditBox.InputFlag.DEFAULT;
    }
    get align() {
        return this._editBox.textLabel.horizontalAlign;
    }
    set align(value) {
        this._editBox.textLabel.horizontalAlign = value;
        if (this._editBox.placeholderLabel) {
            this._editBox.placeholderLabel.horizontalAlign = value;
        }
    }
    get verticalAlign() {
        return this._editBox.textLabel.verticalAlign;
    }
    set verticalAlign(value) {
        this._editBox.textLabel.verticalAlign = value;
        if (this._editBox.placeholderLabel) {
            this._editBox.placeholderLabel.verticalAlign = value;
        }
    }
    get singleLine() {
        return this._editBox.inputMode != EditBox.InputMode.ANY;
    }
    set singleLine(value) {
        this._editBox.inputMode = value ? EditBox.InputMode.SINGLE_LINE : EditBox.InputMode.ANY;
    }
    requestFocus() {
        this._editBox.focus();
    }
    markSizeChanged() {
        //不支持自动大小，所以这里空
    }
    updateText() {
        let text2 = this._text;
        if (this._templateVars)
            text2 = this.parseTemplate(text2);
        if (this._ubbEnabled) //不支持同一个文本不同样式
            text2 = defaultParser.parse(text2, true);
        this._editBox.string = text2;
    }
    updateFont() {
        this.assignFont(this._editBox.textLabel, this._realFont);
        if (this._editBox.placeholderLabel)
            this.assignFont(this._editBox.placeholderLabel, this._realFont);
    }
    updateFontColor() {
        this.assignFontColor(this._editBox.textLabel, this._color);
    }
    updateFontSize() {
        this._editBox.textLabel.fontSize = this._fontSize;
        this._editBox.textLabel.lineHeight = this._fontSize + this._leading;
        if (this._editBox.placeholderLabel)
            this._editBox.placeholderLabel.fontSize = this._editBox.textLabel.fontSize;
    }
    updateOverflow() {
        //not supported
    }
    onTextChanged() {
        this._text = this._editBox.string;
    }
    onTouchEnd1(evt) {
        this._editBox.openKeyboard();
    }
    setup_beforeAdd(buffer, beginPos) {
        super.setup_beforeAdd(buffer, beginPos);
        buffer.seek(beginPos, 4);
        let str = buffer.readS();
        if (str != null)
            this.promptText = str;
        else if (this._editBox.placeholderLabel)
            this._editBox.placeholderLabel.string = "";
        str = buffer.readS();
        if (str != null)
            this.restrict = str;
        let iv = buffer.readInt();
        if (iv != 0)
            this.maxLength = iv;
        iv = buffer.readInt();
        if (iv != 0) { //keyboardType
        }
        if (buffer.readBool())
            this.password = true;
        //同步一下对齐方式
        if (this._editBox.placeholderLabel) {
            const hAlign = this._editBox.textLabel.horizontalAlign;
            this._editBox.placeholderLabel.horizontalAlign = hAlign;
            const vAlign = this._editBox.textLabel.verticalAlign;
            this._editBox.placeholderLabel.verticalAlign = vAlign;
        }
    }
}
let MyEditBox = class MyEditBox extends EditBox {
    _registerEvent() {
        //取消掉原来的事件处理
    }
    // _syncSize() {
    //     let size = this.node._uiProps.uiTransformComp.contentSize;
    //     let impl = this["_impl"];
    //     impl.setSize(size.width, size.height);
    //     if (this.textLabel)
    //         this.textLabel.node._uiProps.uiTransformComp.setContentSize(size.width, size.height);
    //     if (this.placeholderLabel)
    //         this.placeholderLabel.node._uiProps.uiTransformComp.setContentSize(size.width, size.height);
    // }
    openKeyboard() {
        const impl = this["_impl"];
        if (impl) {
            impl.beginEditing();
        }
    }
};
MyEditBox = __decorate([
    ccclass('fgui.EditBox')
], MyEditBox);
