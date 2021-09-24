import { ByteArray } from "../../melon_runtime/utils/ByteArray";

export interface client_lg_auth_ack {
	gateKey: string;
	gateIp: string;
	gatePort: number;
	account: string;
}

export interface client_ct_login_ack {
	isQueuing: boolean;
	sessionKey: string;
}

export interface client_gs_enter_ack {
	activeRoleId: number;
	roleInfo: data_role_base_data;
	errorCode: number;
}

export interface data_role_base_data {
	roleId: number;
	roleName: string;
	openId: string;
	channelId: string;
	subChannelId: string;
	phone: string;
	areaId: number;
	createTime: number;
	sex: number;
	job: number;
	level: number;
	exp: number;
	hp: number;
	mapId: number;
	lastMapId: number;
	posx: number;
	posy: number;
	posz: number;
	lastLoginTime: number;
	lastOfflineTime: number;
	baseData: data_base_data_info;
	backPackData: data_back_pack_data_info;
	data: ByteArray;
}

export interface data_back_pack_data_info {
}

export interface data_base_data_info {
	token_1: number;
	token_2: number;
	token_3: number;
	token_4: number;
	token_5: number;
	token_6: number;
	token_7: number;
	token_8: number;
	token_9: number;
	token_10: number;
	roleAtrList: data_entity_attr_list;
	equipList: data_wore_equip[];
	skillList: data_skill_info[];
}

export interface data_entity_attr_list {
	attrList: data_msg_attr_value[];
}

export interface data_wore_equip {
	position: number;
	item: data_item_info;
}

export interface data_item_info {
	itemGuid: number;
	itemId: number;
	itemNum: number;
	posIndex: number;
	createTime: number;
}

export interface data_msg_attr_value {
	id: number;
	val: number;
}

export interface data_skill_info {
	skillGuid: number;
	skillId: number;
	skillLevel: number;
	skillExp: number;
}

export interface client_ct_make_new_role_ack {
	activeRoleId: number;
	loginRoleInfos: data_login_role_info[];
	errorCode: number;
}

export interface data_login_role_info {
	roleId: number;
	roleName: string;
	sex: number;
	job: number;
	level: number;
	gsId: number;
	data: ByteArray;
}

export interface client_ct_role_list_get_ack {
	activeRoleId: number;
	loginRoleInfos: data_login_role_info[];
}

/**
 * 客户端协议编号
 */
export enum SDO_Client_Msg {
    client_lg_auth_ack_res = 4196,
    client_ct_login_ack_res = 4197,
    client_ct_make_new_role_ack_res = 4198,
    client_ct_role_list_get_ack_res = 4199,
    client_gs_enter_ack = 4200,
    client_gs_forward_ack = 4205,
}

export enum SDO_Game_Msg {
    game_cl_enter_req = 16485,
    game_db_role_info_get_ack = 16486,
    game_db_save_role_info_ack = 16488,
    game_db_get_data_ack = 16489,
    game_db_init_tables_ack = 16490,
    game_cl_forward_req = 16589
}

/**
 * 登陆获gate连接
 */
export enum SDO_Login_Msg {
    login_cl_auth_req = 8193,
}

/**
 * gate协议编号
 */
export enum SDO_Gate_Msg {
    gate_cl_login_req = 12389,
    gate_cl_register_req = 20582,
}

/**
 * pb协议编号，对应客户端协议数据解析
 */
export enum PBDictKey {
	center_lg_auth_req = 0,
	center_gg_login_req = 1,
	center_cl_make_new_role_req = 2,
	center_db_make_new_role_ack = 3,
	center_cl_role_list_get_req = 4,
	center_db_role_list_get_ack = 5,
	center_gs_enter_rpt = 6,
	center_gs_role_offline_rpt = 7,
	data_login_role_info = 8,
	data_msg_attr_value = 9,
	data_entity_attr_list = 10,
	data_base_data_info = 11,
	data_back_pack_data_info = 12,
	data_role_base_data = 13,
	data_role_extra_info = 14,
	data_monster_extra_info = 15,
	data_object_look_info = 16,
	data_item_info = 17,
	data_item_backpack = 18,
	data_item_backpack_list = 19,
	data_wore_equip = 20,
	data_skill_info = 21,
	common_vec3 = 22,
	client_gt_keep_alive_ack = 23,
	client_lg_auth_ack = 24,
	client_ct_login_ack = 25,
	client_ct_make_new_role_ack = 26,
	client_ct_role_list_get_ack = 27,
	client_gs_enter_ack = 28,
	client_gs_move_type_ntf = 29,
	client_gs_move_sync_fade_out_ntf = 30,
	client_gs_move_sync_fade_in_ntf = 31,
	client_gs_move_stop_ntf = 32,
	client_gs_custom_param_ntf = 33,
	client_gs_levelup_ack = 34,
	client_gs_skill_cast_ntf = 35,
	client_hit_info = 36,
	client_gs_skill_hit_ntf = 37,
	client_gs_buff_add_ntf = 38,
	client_gs_buff_delete_ntf = 39,
	client_gs_attr_sync_notify = 40,
	client_gs_forward_ack = 41,
	db_ct_role_list_get_req = 42,
	db_ct_make_new_role_req = 43,
	db_gs_role_info_get_req = 44,
	db_gs_save_role_info_req = 45,
	db_gs_get_data_req = 46,
	db_gs_set_data_rpt = 47,
	db_gs_init_tables_req = 48,
	event_event_connect = 49,
	event_event_accept = 50,
	event_event_disconnect = 51,
	event_event_reg_server = 52,
	event_event_reg_server_ack = 53,
	game_cl_enter_req = 54,
	game_db_role_info_get_ack = 55,
	game_db_save_role_info_ack = 56,
	game_cl_char_enter_scene_complete_rpt = 57,
	game_cl_move_target_rpt = 58,
	game_cl_move_stop_rpt = 59,
	game_cl_levelup_req = 60,
	game_cl_change_attr_req = 61,
	game_cl_skill_cast_rpt = 62,
	game_cl_custom_param_rpt = 63,
	game_cl_forward_req = 64,
	game_db_get_data_ack = 65,
	game_db_init_tables_ack = 66,
	gate_cl_keep_alive_req = 67,
	gate_ct_auth_ntf = 68,
	gate_cl_login_req = 69,
	gate_cl_kick_off_one_ntf = 70,
	login_cl_auth_req = 71,
	login_ct_auth_ack = 72,
	relation_gs_enter_rpt = 73,
	relation_gs_role_offline_rpt = 74
}

/**
 * protol解析对应的值
 */
export const protol_sm_kv: { [msgId: number]: PBDictKey } = {};
export const protol_cm_kv: { [msgId: number]: PBDictKey } = {};
const add_protol_sm_kv = function(pbKye: PBDictKey, msgId: number) {
    protol_sm_kv[msgId] = pbKye;
}
const add_protol_cm_kv = function(pbKye: PBDictKey, msgId: number) {
    protol_cm_kv[msgId] = pbKye;
}
add_all_protol_sm_kv();
add_all_protol_cm_kv();

function add_all_protol_sm_kv() {
    add_protol_sm_kv(PBDictKey.client_lg_auth_ack, SDO_Client_Msg.client_lg_auth_ack_res);
    add_protol_sm_kv(PBDictKey.client_ct_login_ack, SDO_Client_Msg.client_ct_login_ack_res);
    add_protol_sm_kv(PBDictKey.client_ct_role_list_get_ack, SDO_Client_Msg.client_ct_role_list_get_ack_res);
    add_protol_sm_kv(PBDictKey.client_ct_make_new_role_ack, SDO_Client_Msg.client_ct_make_new_role_ack_res);
    add_protol_sm_kv(PBDictKey.client_gs_enter_ack, SDO_Client_Msg.client_gs_enter_ack);
    add_protol_sm_kv(PBDictKey.client_gs_forward_ack, SDO_Client_Msg.client_gs_forward_ack);
}
function add_all_protol_cm_kv() {
    add_protol_cm_kv(PBDictKey.login_cl_auth_req, SDO_Login_Msg.login_cl_auth_req);
    add_protol_cm_kv(PBDictKey.gate_cl_login_req, SDO_Gate_Msg.gate_cl_login_req);
	add_protol_cm_kv(PBDictKey.center_cl_make_new_role_req, SDO_Gate_Msg.gate_cl_register_req);
	add_protol_cm_kv(PBDictKey.game_cl_enter_req, SDO_Game_Msg.game_cl_enter_req);
    add_protol_cm_kv(PBDictKey.game_cl_forward_req, SDO_Game_Msg.game_cl_forward_req);
}