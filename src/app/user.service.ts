import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/compat/firestore";
import {BehaviorSubject, filter, first} from "rxjs";
import {isNonNull} from "../util";
import {AuthService} from "./auth.service";

export interface User {
  hasWriteAccess: boolean;
  bookmarkedFiles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  isLoggedIn$ = new BehaviorSubject<boolean>(false);
  userRef$ = new BehaviorSubject<AngularFirestoreDocument | undefined>(undefined);
  user$ = new BehaviorSubject<User | undefined>(undefined);

  constructor(
    private db: AngularFirestore,
    private auth: AuthService,
  ) {
    this.auth.user
      .subscribe(user => {
        this.isLoggedIn$.next(user != null);
        if (user != null) {
          const userRef = this.db.doc<User>("users/" + user?.uid);
          this.userRef$.next(userRef);
          userRef.valueChanges().subscribe(userDoc => {
            if (userDoc == undefined) {
              userRef.set({
                hasWriteAccess: false,
                bookmarkedFiles: []
              });
            } else {
              this.user$.next(userDoc);
            }
          });
        }
      });
  }

  getUser() {
    return this.user$.pipe(filter(isNonNull));
  }

  toggleBookmark(file: string) {
    this.getUser().pipe(first()).subscribe(user => {
      if (user.bookmarkedFiles.includes(file)) {
        user.bookmarkedFiles = user.bookmarkedFiles.filter(bookmark => bookmark != file);
      } else {
        user.bookmarkedFiles.unshift(file);
      }
      this.userRef$.subscribe(userRef => {
        userRef?.set(user);
      });
    });
  }
}
