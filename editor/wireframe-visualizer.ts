import {
	Color, Component,


	GFXAttributeName, GFXPrimitiveMode,
	Material,





	MeshRenderer, Node, utils,

	Vec3, _decorator
} from 'cc';
import { DEBUG, EDITOR } from 'cc/env';
import { Polygons } from '../navmesh/Builder';
const { ccclass, property, requireComponent, executeInEditMode } = _decorator;
const v3_1 = new Vec3();
const v3_2 = new Vec3();

@ccclass('WireframeVisualizer')
@requireComponent(MeshRenderer)
@executeInEditMode
export class WireframeVisualizer extends Component {
	@property(Node)
	target: Node = null;

	@property
	extrude = 0.001;

	@property
	primitiveIndex = 0;

	@property
	color = Color.WHITE.clone();

	_material = new Material();

	@property
	set apply(val) {
		this.refresh();
	}
	get apply() {
		return false;
	}

	public start() {
		if (EDITOR || DEBUG) {
			this._material.initialize({
				effectName: 'builtin-unlit',
				defines: { USE_COLOR: true },
				states: { primitive: GFXPrimitiveMode.LINE_LIST },
			});
			this.refresh();
		}
	}

	public refresh() {
		if (EDITOR || DEBUG) {
			const comp = this.target.getComponent(MeshRenderer);
			if (!this.target || !comp) {
				return;
			}
			const mesh = comp.mesh;
			const positions = mesh.readAttribute(
				this.primitiveIndex,
				GFXAttributeName.ATTR_POSITION
			);
			const normals = mesh.readAttribute(
				this.primitiveIndex,
				GFXAttributeName.ATTR_NORMAL
			);
			const indices = mesh.readIndices(this.primitiveIndex);

			const s = this.node.getComponent(MeshRenderer);
			s.material = this._material;
			s.material.setProperty('color', this.color);

			s.mesh = utils.createMesh({
				positions: this._generateWireframeVB(positions, normals),
				indices: this._generateWireframeIB(indices),
				primitiveMode: GFXPrimitiveMode.LINE_LIST,
				minPos: mesh.minPosition,
				maxPos: mesh.maxPosition,
			});
		}
	}

	public set(navmesh: Polygons): void {
		const s = this.node.getComponent(MeshRenderer);
		const comp = this.target.getComponent(MeshRenderer);
		if (!this.target || !comp) {
			return;
		}

		const mesh = comp.mesh;
		s.mesh = utils.createMesh({
			positions: this._vec32array(navmesh.vertices),
			indices: this._vec32array(navmesh.ibs),
			primitiveMode: GFXPrimitiveMode.LINE_LIST,
			minPos: mesh.minPosition,
			maxPos: mesh.maxPosition,
		});
	}

	private _vec32array(list: Vec3[]): number[] {
		const len = list.length;
		const array: number[] = [];
		for (let i = 0; i < len; i++) {
			Vec3.toArray(array, list[i], i * 3);
		}

		return array;
	}

	private _generateWireframeVB(positions: Storage, normals: Storage) {
		if (EDITOR || DEBUG) {
			const len = positions.length / 3;
			const res: number[] = [];

			// for (let i = 0; i < len; i++) {
			//   Vec3.fromArray(v3_1, positions, i * 3);
			//   Vec3.fromArray(v3_2, normals, i * 3);
			//   Vec3.scaleAndAdd(v3_1, v3_1, Vec3.normalize(v3_2, v3_2), this.extrude);
			//   Vec3.toArray(res, v3_1, i * 3);
			// }

			for (let i = 0, l = positions.length; i < l; i += 3) {
				v3_1.set(positions[i], positions[i + 1], positions[i + 2]);
				v3_1.transformMat4(this.target.worldMatrix);
				Vec3.toArray(res, v3_1, i);
			}
			return res;
		}
	}

	private _generateWireframeIB(
		indices: Uint8Array | Uint16Array | Uint32Array
	) {
		if (EDITOR || DEBUG) {
			const res: number[] = [];
			const len = indices.length / 3;
			for (let i = 0; i < len; i++) {
				const a = indices[i * 3 + 0];
				const b = indices[i * 3 + 1];
				const c = indices[i * 3 + 2];
				res.push(a, b, b, c, c, a);
			}
			return res;
		}
	}
}
