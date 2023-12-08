import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/firestore";
import { plainToClass } from "class-transformer";
import { Observable } from "rxjs";
import { ICrud } from "./icore.interface";
import { Model } from "./model";
import { map } from 'rxjs/operators'

export abstract class ServiceFirebase<T extends Model> implements ICrud<T>{

    ref: AngularFirestoreCollection<T>
    // obj = null

    constructor(
        protected type: { new(): T },
        protected firestore: AngularFirestore,
        public path: string
    ) {
        this.ref = this.firestore.collection<T>(this.path)
    }


    get(id: string): Observable<T> {
        let doc = this.ref.doc<T>(id)
        return doc.get()
            .pipe(map(
                (snapshot) => this.docToClass(snapshot)
            ))
    }

    docToClass(snapshotDoc: any): T {
        let obj = {
            id: snapshotDoc.id,
            ...snapshotDoc(snapshotDoc.data() as T)
        }
        let typed = plainToClass(this.type, obj)
        return typed
    }


    list(): Observable<T[]> {
        return this.ref.valueChanges()
    }

    createOrUpdate(item: T): Promise<T> | any {
        let obj = item
        this.ref.add(obj).then(res => {
            obj.id = res.id
            this.ref.doc(res.id).set(obj)
        })
    }


    delete(id: string): Promise<void> {
        return this.ref.doc(id).delete()
    }

}