import { Component, director, error, find, gfx, js, Mat3, MeshRenderer, Node, Terrain, Vec2, Vec3, _decorator } from "cc";
import { DEBUG, EDITOR } from "cc/env";

const { ccclass, property, inspector, executeInEditMode } = _decorator;

export interface IPostData {
	/**相对工程目录地址 */
	path: string;
	/**obj数据 */
	data: string;
	/**文件名 */
	fileName: string;
	/**是否显示存储弹窗 */
	isHideShowDialog: boolean;
}

@ccclass("Scene2Obj")
@executeInEditMode(true)
export class Scene2Obj extends Component {
	@property
	public saveObj: boolean = false;

	private numVertices: number = 0;
	private numNormals: number = 0;
	private numUvs: number = 0;
	private startIndex: number = 0;

	public exportStart() {
		this.startIndex = 0;
		this.numVertices = 0;
		this.numNormals = 0;
		this.numUvs = 0;
	}
	public exportEnd() {
		this.startIndex = 0;
	}

	public start(): void {
		if (DEBUG) {
			if (!EDITOR && this.saveObj) {
				window["Scene2OBJ"] = () => {
					this.Scene2OBJ(find("terrain"), true);
				};
			}
		}
	}

	onFocusInEditor(): void {
		console.log("onFocusInEditor");
		if (this.saveObj) {
			const scene = director.getScene();
			if(!scene){
				return;
			}
			const terrainNode = scene.getChildByName("terrain");
			if(terrainNode){
				this.Scene2OBJ(terrainNode);
			}
		}
	}

	public Scene2OBJ(sRoot: Node, active: boolean = false): void {
		//@ts-ignore

		// 利用宏编译剔除代码
		// 第一不带入到运行时
		// 第二可以防止别人窃取代码
		if (EDITOR || active) {
			if (!sRoot) {
				console.error("没有找到地形数据根节点:terrain");
				return;
			}
			console.log("Scene2OBJ start");
			const body: IPostData = js.createMap();
			body.data = this.doExport(sRoot, active);
			if (!body.data) {
				return;
			}
			console.log("save2obj send msg to plugin scene2obj");
			//@ts-ignore
			Editor.Message.send("scene2obj", "scene2obj", body);
		}
	}

	private doExport(node: Node, active: boolean): string {
		if (EDITOR || active) {
			this.exportStart();

			let mesh_string = "#" + node.name + ".obj";
			const original_position = node.position;
			node.setPosition(Vec3.ZERO);
			mesh_string += this.process(node, active);
			node.setPosition(original_position);

			return mesh_string;
		}
	}

	private process(node: Node, active: boolean): string {
		if (EDITOR || active) {
			let string = "#" + node.name + "\n#-------" + "\n";
			string += "g " + node.name + "\n";

			const str = this.mesh2string(node, active);
			if (str) {
				string += str;
			}

			return string;
		}
	}

	private nodeActive(node: Node): boolean {
		let active = true;
		if (!node.active) {
			return false;
		}
		let n: Node | null = node;
		while ((n = n.parent)) {
			if (n && !n.active) {
				active = false;
				break;
			}
		}

		return active;
	}

	private mesh2string(node: Node, active: boolean): string | undefined {
		if (EDITOR || active) {
			if (node.name == "navmesh") {
				return "";
			}

			let string = "#" + node.name + "\n";

			const model = node.getComponent(MeshRenderer);
			const terria = node.getComponent(Terrain);

			const vertex = new Vec3();
			const uv = new Vec2();
			const normal = new Vec3();
			const mat3 = new Mat3();
			const face: string[] = [];

			if (!model && terria) {
				// TODO TERRIAL
				//   terria.getBlocks().forEach((e) => {
				//     //@ts-ignore
				//     let node = e._node;
				//     //@ts-ignore
				//     let _renderable = node.getComponent('TerrainRenderable');
				//     let _mesh = _renderable._meshData;
				//     if (_mesh) {
				//       let vb = _mesh.vertexBuffers as GFXBuffer[];
				//       let va = _mesh.attributes as IGFXAttribute[];
				//       let ib = _mesh.indexBuffer as GFXBuffer;
				//       vb.forEach((e, i) => {
				//         let view = new DataView(e.bufferView.buffer);
				//         let vertices = readBuffer(view, va[i].format, 0, e.size, e.stride);
				//         let num_vertices = 0;
				//         let num_normals = 0;
				//         let num_uvs = 0;
				//         // vertices
				//         for (let i = 0, l = vertices.length; i < l; i += 3) {
				//           num_vertices++;
				//           vertex.set(vertices[i], vertices[i + 1], vertices[i + 2]);
				//           vertex.transformMat4(node.worldMatrix);
				//           string +=
				//             'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';
				//         }
				//         Mat3.fromMat4(mat3, node.worldMatrix);
				//         mat3.invert().transpose();
				//       });
				//       let indices_view = new DataView(ib.bufferView.buffer);
				//     }
				//   });
			}

			if (model && model.enabled && this.nodeActive(node)) {
				const mesh = model.mesh;
				if (!mesh) {
					return `####mesh2string${node.name}Error####`;
				}
				string += "g " + node.name + "\n";
				mesh.renderingSubMeshes.forEach((e, i) => {
					let num_vertices = 0;
					let num_normals = 0;
					let num_uvs = 0;

					const vertices = mesh.readAttribute(i, gfx.AttributeName.ATTR_POSITION) as Float32Array;
					const uvs = mesh.readAttribute(i, gfx.AttributeName.ATTR_TEX_COORD) as Float32Array;
					const normals = mesh.readAttribute(i, gfx.AttributeName.ATTR_NORMAL) as Float32Array;
					const indices = mesh.readIndices(i);

					// vertices
					for (let i = 0, l = vertices.length; i < l; i += 3) {
						num_vertices++;
						vertex.set(vertices[i], vertices[i + 1], vertices[i + 2]);
						vertex.transformMat4(node.worldMatrix);
						string += "v " + vertex.x + " " + vertex.y + " " + vertex.z + "\n";
					}

					// uv
					for (let i = 0, l = uvs.length; i < l; i += 2) {
						num_uvs++;
						uv.set(uvs[i], uvs[i + 1]);
						string += "vt " + uv.x + " " + uv.y + "\n";
					}

					Mat3.fromMat4(mat3, node.worldMatrix);
					mat3.invert().transpose();
					// normals
					for (let i = 0, l = normals.length; i < l; i += 3) {
						num_normals++;
						normal.set(normals[i], normals[i + 1], normals[i + 2]);
						Vec3.transformMat3(normal, normal, mat3);
						string += "vn " + normal.x + " " + normal.y + " " + normal.z + "\n";
					}

					// indices
					if (!indices) {
						error("无索引,先打个标记再说");
					} else {
						for (let i = 0, l = indices.length; i < l; i += 3) {
							for (let j = 0, len = 3; j < len; j++) {
								const x = indices[i + j] + 1;

								face[j] =
									this.numVertices +
									x +
									"/" +
									(uvs ? this.numUvs + x : "") +
									"/" +
									(this.numNormals + x);
							}

							string += "f " + face.join(" ") + "\n";
						}
					}

					this.numNormals += num_normals;
					this.numVertices += num_vertices;
					this.numUvs += num_uvs;
				});
			}
			node.children.forEach(e => {
				const str = this.mesh2string(e, active);
				if (str) {
					string += str;
				}
			});

			return string;
		}
	}
}
