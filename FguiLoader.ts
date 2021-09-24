import { AssetManager, resources } from "cc";
import { UIPackage } from "fairygui-cc";


export default class FguiLoader {
    static _ins:FguiLoader;
    static getInstance(){
        if(!this._ins){
            this._ins = new FguiLoader();
        }
        return this._ins;
    }

	public loadUIPkg(name: string, onProgress?: (finish: number, total: number, item: AssetManager.RequestItem) => void, onComplete?: (error: any, pkg: UIPackage) => void){
		const pkg = UIPackage.getByName(name);
		if (!pkg) {
			const pkgPath = `ui/${name}`;
			UIPackage.loadPackage(resources,pkgPath,onProgress,(error,pkg)=>{
                if(error){
                    onComplete && onComplete(error,pkg);
                    return ;
                }

                const depends = pkg.dependencies;
                const loadDepends = [];
                for (let index = 0; index < depends.length; index++) {
                    const depend = depends[index];
                    const dependPkg = UIPackage.getById(depend.id);
                    if(!dependPkg){
                        loadDepends.push(depend);
                    }else{
                        dependPkg.addRef();
                    }
                }
                if(loadDepends.length==0){
                    onComplete && onComplete(error,pkg);
                }else{
                    let total = loadDepends.length;
                    let lastErr: Error;
                    const onDependsComplete = (error: any, _pkg: UIPackage)=>{
                        total--;

                        if(_pkg){
                            _pkg.addRef();
                        }

                        if (error)
                            lastErr = error;

                        if (total <= 0) {
                            onComplete && onComplete(lastErr,pkg);
                        }
                    }
                    loadDepends.forEach(d => {
                        const pkgPath = `ui/${d.name}`;
                        UIPackage.loadPackage(resources,pkgPath,onDependsComplete);
                    });
                }
			});
		} else {
			onComplete && onComplete(null,pkg);
		}
	}

	public unloadUIPkg(name:string){
		const pkg = UIPackage.getByName(name);
		if(pkg){
            pkg.decRef(true);

            if(pkg.refCount==0){
                const depends = pkg.dependencies;
                for (let index = 0; index < depends.length; index++) {
                    const depend = depends[index];
                    const dependPkg = UIPackage.getById(depend.id);
                    if(dependPkg){
                        dependPkg.decRef(true);
                    }
                }
            }
		}
	}


}
