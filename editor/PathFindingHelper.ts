import {
	Camera,

	Component,








	_decorator
} from "cc";
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass("PathFindingHelper")
@executeInEditMode
export class PathFindingHelper extends Component {
	@property(Camera)
	public camera: Camera = null!;

	@property
	public buf: string = "";

	@property
	public displayNavmesh = false;

	public start(): void {
	}

}
