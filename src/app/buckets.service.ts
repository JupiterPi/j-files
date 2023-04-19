import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {AngularFireStorage} from "@angular/fire/compat/storage";
import {map} from "rxjs";

export interface Bucket {
  name: string;
  isWritable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BucketsService {
  constructor(
    private db: AngularFirestore,
    private storage: AngularFireStorage,
  ) {}

  getAllBuckets() {
    return this.db.collection<Bucket>("buckets").valueChanges();
  }

  getBucket(name: string) {
    return this.db.collection<Bucket>("buckets", ref => {
      return ref.where("name", "==", name).limit(1)
    }).valueChanges().pipe(map(buckets => buckets[0]));
  }

  getStoragePath(name: string) {
    return "/buckets/" + name;
  }
}
