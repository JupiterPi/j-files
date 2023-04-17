import { Injectable } from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {BehaviorSubject, filter} from "rxjs";
import {isNonNull} from "../util";

export interface User {
  hasWriteAccess: boolean;
  bookmarkedFiles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  $user = new BehaviorSubject<User | undefined>(undefined);

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
  ) {
    this.auth.user
      .pipe(filter(user => user != null))
      .subscribe(user => {
        const userRef = this.db.doc<User>("users/" + user?.uid);
        userRef.valueChanges().subscribe(userDoc => {
          if (userDoc == undefined) {
            userRef.set({
              hasWriteAccess: false,
              bookmarkedFiles: []
            });
          } else {
            this.$user.next(userDoc);
          }
        });
      });
  }

  getUser() {
    return this.$user.pipe(filter(isNonNull));
  }
}
