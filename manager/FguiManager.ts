import { UIConfig, UIObjectFactory } from "fairygui-cc";
import AdventureItem from "../../module/adventure/com/AdventureItem";
import LevelAwardItem from "../../module/adventure/com/LevelAwardItem";
import LevelBgCom from "../../module/adventure/com/LevelBgCom";
import ZhoumuItemCom from "../../module/adventure/com/ZhoumuItemCom";
import ZhoumuSeleCom from "../../module/adventure/com/ZhoumuSeleCom";
import SkipCom from "../../module/bag/view/SkipCom";
import CostItem from "../../module/bases/com/CostItem";
import FuncDescItem from "../../module/bases/com/FuncDescItem";
import TalentItemComp from "../../module/bases/com/TalentItemComp";
import TalentView from "../../module/bases/TalentView";
import TwoLayerVProBar from "../../module/battle/com/TwoLayerVProBar";
import { JoystickView } from "../../module/battle/JoystickView";
import ChatMsgItem from "../../module/chat/ChatMsgItem";
import ChatSystemItem from "../../module/chat/ChatSystemItem";
import DayCheck from "../../module/checkIn/DayCheck";
import ChipCom from "../../module/chip/ChipCom/ChipCom";
import CountdownCom from "../../module/common/CountdownCom";
import DropItem from "../../module/common/DropItem";
import ItemComSel from "../../module/common/ItemComSel";
import ResBarCom from "../../module/common/ResBarCom";
import AttrItemCom from "../../module/equip/equipCom/AttrItemCom";
import ComboTips from "../../module/equip/equipCom/ComboTips";
import EquipCom from "../../module/equip/equipCom/EquipCom";
import EquipInfoCom from "../../module/equip/equipCom/EquipInfoCom";
import EquipProValueCom from "../../module/equip/equipCom/EquipProValueCom";
import { EquipTipsView } from "../../module/equip/equipCom/EquipTipsView";
import ItemCom from "../../module/equip/equipCom/ItemCom";
import ItemComStage from "../../module/equip/equipCom/ItemComStage";
import ItemComUpg from "../../module/equip/equipCom/ItemComUpg";
import { TankInfoCom } from "../../module/equip/equipCom/TankInfoCom";
import TankNode from "../../module/equip/equipCom/TankNode";
import TankProCom from "../../module/equip/equipCom/TankProCom";
import GoldItem from "../../module/getResources/com/GoldItem";
import ResViewItemCom from "../../module/getResources/com/ResViewItemCom";
import StrengthItem from "../../module/getResources/com/StrengthItem";
import TimeGetResItem from "../../module/getResources/com/TimeGetResItem";
import VedioGetResItem from "../../module/getResources/com/VedioGetResItem";
import GiftCom from "../../module/giftBag/GiftCom";
import UserProItem from "../../module/gm/UserProItem";
import MailItem from "../../module/mailList/MailItem";
import MainBackground from "../../module/main/com/MainBackground";
import TopPanel from "../../module/main/com/TopPanel";
import EquipSkillCom from "../../module/pause/com/EquipSkillCom";
import TimeEffect from "../../module/pause/com/TimeEffect";
import PropsAttrItem from "../../module/popup/PropsAttrItem";
import GlobalModalWaiting from "../../module/preload/GlobalModalWaiting";
import ConditionItem from "../../module/role/ConditionItem";
import RoleAttrItem from "../../module/role/RoleAttrItem";
import RoleBagDele from "../../module/role/RoleBagDele";
import RoleEquipDele from "../../module/role/RoleEquipDele";
import RoleModelDele from "../../module/role/RoleModelDele";
import StrengthenAttrDele from "../../module/role/StrengthenAttrDele";
import StrengthenAttrItem from "../../module/role/StrengthenAttrItem";
import StrengthenConsumeDele from "../../module/role/StrengthenConsumeDele";
import StrengthenEquipDele from "../../module/role/StrengthenEquipDele";
import ShopItemCom from "../../module/Shop/ShopItemCom";
import DropSkillItem from "../../module/skill/DropSkillItem";
import SkillItemCom from "../../module/skill/SkillItemCom";
import SmeltPanel from "../../module/synthesis/com/SmeltPanel";
import SynthesisCom from "../../module/synthesis/com/SynthesisCom";
import SynthesisPanel from "../../module/synthesis/com/SynthesisPanel";
import TaskActivityCom from "../../module/task/com/TaskActivityCom";
import TaskBoxItem from "../../module/task/com/TaskBoxItem";
import TaskItem from "../../module/task/com/TaskItem";
import SoundSetting from "../../module/userInfo/com/SoundSetting";
import WarChipCell from "../../module/warOrder/com/WarChipCell";
import WarChipList from "../../module/warOrder/com/WarChipList";
import WarCom from "../../module/warOrder/com/WarCom";
import WarIconItem from "../../module/warOrder/com/WarIconItem";
import WarOrderCell from "../../module/warOrder/com/WarOrderCell";

/*
 * @Author: yanmingjie0223@qq.com
 * @Date: 2019-01-21 16:09:28
 * @Last Modified by: yanmingjie.jack@shandagames.com
 * @Last Modified time: 2021-05-12 19:47:10
 */
export default class FguiManager {
	private static _instance: FguiManager;
	public static getInstance(): FguiManager {
		if (!this._instance) {
			this._instance = new FguiManager();
		}
		return this._instance;
	}

	public init(): void {
		this.bindComponent();
	}

	/**
	 * 初始化设置
	 */
	public initConfig(): void {
		//const font = resources.get(FontPath.default, Font);
		//fgui.registerFont(FontType.default, font);
		//UIConfig.defaultFont = FontType.default;
		UIConfig.globalModalWaiting = "ui://preload/GlobalModalWaiting";
		UIConfig.windowModalWaiting = "ui://preload/GlobalModalWaiting";
		UIConfig.buttonSound = "ui://common/4_Common_Button";
	}

	/**
	 * 绑定fgui到类
	 */
	private bindComponent(): void {
		const setExtension: Function = UIObjectFactory.setExtension;
		setExtension("ui://preload/GlobalModalWaiting", GlobalModalWaiting);
		/**旋转控件 */
		setExtension("ui://battle/JoystickView", JoystickView);
		setExtension("ui://battle/TwoProBar", TwoLayerVProBar);
		setExtension("ui://battle/BloodBar", TwoLayerVProBar);
		setExtension("ui://battle/LoadingBar", TwoLayerVProBar);

		setExtension("ui://battle/skillItem", SkillItemCom);
		setExtension("ui://battle/dropSkillItem", DropSkillItem);
		setExtension("ui://battle/shopItem", ShopItemCom);

		/**装备图标组件 */
		setExtension("ui://equips/equipInfo", EquipInfoCom);
		/**主页面头部组件 */
		setExtension("ui://main/TopPanel", TopPanel);
		/**倒计时组件 */
		setExtension("ui://pause/TimeEffect", TimeEffect);
		/**战内装备技能显示组件 */
		setExtension("ui://pause/equipSkill", EquipSkillCom);
		/**装备图标组件 */
		setExtension("ui://common/itemComp", ItemCom);
		setExtension("ui://common/itemComSel", ItemComSel);
		/**进阶图标组件 */
		setExtension("ui://equips/itemComStage", ItemComStage);
		setExtension("ui://equips/itemComUpg", ItemComUpg);
		setExtension("ui://synthesis/itemComStage", ItemComStage);
		/**芯片组件 */
		setExtension("ui://chip/ChipCom", ChipCom);
		/**详情界面 */
		setExtension("ui://equips/equipTips", EquipTipsView);
		/**装备属性组件 */
		setExtension("ui://equips/proCom", EquipProValueCom);
		setExtension("ui://bag/proCom", EquipProValueCom);
		setExtension("ui://common/skipCom", SkipCom);
		/**坦克属性组件 */
		setExtension("ui://equips/proVlaue", TankProCom);
		/**通用物品item，在关卡、暂停、结算、弹窗界面中使用 */
		setExtension("ui://common/itemCom", DropItem);
		setExtension("ui://common/ConditionItem", ConditionItem);
		setExtension("ui://equips/equipCom", EquipCom);
		/**主界面背景 */
		setExtension("ui://main/bg_main", MainBackground);
		//邮件Item
		setExtension("ui://mailList/MailItem", MailItem);
		//每日签到Item
		setExtension("ui://checkIn/awardItem", DayCheck);
		//聊天消息Item
		setExtension("ui://chat/MessageItem", ChatMsgItem);
		setExtension("ui://chat/MessageItemRight", ChatMsgItem);
		setExtension("ui://chat/SystemItem", ChatSystemItem);
		/**获取资源弹窗item */
		setExtension("ui://getResources/resViewItemCom", ResViewItemCom);
		setExtension("ui://getResources/timeGetResItem", TimeGetResItem);
		setExtension("ui://getResources/vedioGetResItem", VedioGetResItem);
		setExtension("ui://getResources/goldItem", GoldItem);
		setExtension("ui://getResources/strengthItem", StrengthItem);

		/**gm */
		setExtension("ui://gm/UserProItem", UserProItem);
		/**task */
		setExtension("ui://task/TaskItem", TaskItem);
		setExtension("ui://task/ActivityCom", TaskActivityCom);
		setExtension("ui://task/BoxItem", TaskBoxItem);
		/**生产基地背景 */
		setExtension("ui://bases/talentView", TalentView);
		setExtension("ui://bases/item_talent", TalentItemComp);

		/**合成组件 */
		setExtension("ui://synthesis/SynthesisPanel", SynthesisPanel);
		/**熔炼组件 */
		setExtension("ui://synthesis/SmeltPanel", SmeltPanel);
		setExtension("ui://synthesis/SynthesisCom", SynthesisCom);
		/**建筑升级所需物品item */
		setExtension("ui://bases/costItem", CostItem);
		/**建筑特殊功能词条组件 */
		setExtension("ui://bases/funcDescItem", FuncDescItem);
		/**音量调整组件 */
		setExtension("ui://userInfo/MusicCom", SoundSetting);
		//隐私协议组件
		// setExtension("ui://userInfo/comText", AgreeMentComText);
		/**倒计时组件 */
		setExtension("ui://getResources/countdown", CountdownCom);
		/**关卡Item */
		setExtension("ui://adventure/adventureItem", AdventureItem);
		/**关卡Item背景 */
		setExtension("ui://adventure/levelBgCom", LevelBgCom);
		/**周目Item */
		setExtension("ui://adventure/buttonZhoumu", ZhoumuItemCom);
		/**关卡奖励Item */
		setExtension("ui://adventure/lvAwardItem", LevelAwardItem);
		/**特惠礼包Item */
		setExtension("ui://giftBag/GiftCom", GiftCom);
		/**新坦克详情 */
		setExtension("ui://equips/attrItem", AttrItemCom);
		setExtension("ui://equips/comboTips", ComboTips);
		setExtension("ui://equips/TankInfo", TankInfoCom);
		setExtension("ui://equips/itemTank", TankNode);
		/**周目选择组件 */
		setExtension("ui://adventure/zhoumuSeleCom", ZhoumuSeleCom);
		/** 角色界面 */
		setExtension("ui://role/RoleBagDele", RoleBagDele);
		setExtension("ui://role/RoleEquipDele", RoleEquipDele);
		setExtension("ui://role/RoleModelDele", RoleModelDele);
		setExtension("ui://role/RoleAttrItem", RoleAttrItem);
		setExtension("ui://role/StrengthenAttrDele", StrengthenAttrDele);
		setExtension("ui://role/StrengthenConsumeDele", StrengthenConsumeDele);
		setExtension("ui://role/StrengthenEquipDele", StrengthenEquipDele);
		setExtension("ui://role/StrengthenAttrItem", StrengthenAttrItem);
		/**popup */
		setExtension("ui://popup/PropsAttrItem", PropsAttrItem);

		/**站令 */
		setExtension("ui://warOrder/WarOrderCell", WarOrderCell);
		setExtension("ui://warOrder/WarIconItem", WarIconItem);
		setExtension("ui://warOrder/WarCom", WarCom);
		setExtension("ui://warOrder/WarChipList", WarChipList);
		setExtension("ui://warOrder/WarChipCell", WarChipCell);
		/**新通用资源栏 */
		setExtension("ui://common/resCom", ResBarCom);
	}
}
