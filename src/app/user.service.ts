import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/compat/firestore";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {BehaviorSubject, filter, first} from "rxjs";
import {isNonNull} from "../util";

export interface User {
  hasWriteAccess: boolean;
  bookmarkedFiles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  $userRef = new BehaviorSubject<AngularFirestoreDocument | undefined>(undefined);
  $user = new BehaviorSubject<User | undefined>(undefined);

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
  ) {
    this.auth.user
      .pipe(filter(user => user != null))
      .subscribe(user => {
        const userRef = this.db.doc<User>("users/" + user?.uid);
        this.$userRef.next(userRef);
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

  toggleBookmark(file: string) {
    this.getUser().pipe(first()).subscribe(user => {
      if (user.bookmarkedFiles.includes(file)) {
        user.bookmarkedFiles = user.bookmarkedFiles.filter(bookmark => bookmark != file);
      } else {
        user.bookmarkedFiles.unshift(file);
      }
      this.$userRef.subscribe(userRef => {
        userRef?.set(user);
      });
    });
  }
}
