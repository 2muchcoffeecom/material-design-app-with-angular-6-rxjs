import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';

import {ConnectableObservable, Observable, of, Subject} from "rxjs/index";
import {filter, map, publish, switchMap, tap, withLatestFrom} from "rxjs/internal/operators";

import { DialogComponent } from './dialog/dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  taskList: { name: string; completed: boolean }[] = [];
  addTask$: Subject<any> = new Subject<any>();
  deleteTask$: Subject<string> = new Subject<string>();
  toggleStatus$: Subject<string> = new Subject<string>();
  updateTask$: Subject<string> = new Subject<string>();

  constructor(
    private dialog: MatDialog,
  ) {
    this.addTask$.pipe(
      switchMap(() => {
        const dialogRef = this.dialog.open(DialogComponent, {
          data: { name: '' },
        });
        return dialogRef.afterClosed();
      }),
      filter((data) => data.choose),
    )
    .subscribe((data) => {
      this.taskList.push({ name: data.name, completed: false });
    });

    this.deleteTask$
    .subscribe((name => {
      this.taskList = this.taskList.filter((task) => task.name !== name);
    }));

    this.toggleStatus$
    .subscribe((name => {
      this.taskList.map((task) => {
        if (task.name === name) {
          task.completed = !task.completed;
        }
      });
    }));

    this.updateTask$.pipe(
      switchMap((name) => {
        const dialogRef = this.dialog.open(DialogComponent, {
          data: { name },
        });
        return dialogRef.afterClosed();
      }),
      filter((data) => data.choose),
    )
    .subscribe((data) => {
      this.taskList.map((task) => {
        if (task.name === data.oldName) {
          task.name = data.name;
        }
      });
    });
  }

  addTask() {
    this.addTask$.next();
  }

  deleteTask(name: string) {
    this.deleteTask$.next(name);
  }

  toggleStatus(name: string) {
    this.toggleStatus$.next(name);
  }

  updateTask(name: string) {
    this.updateTask$.next(name);
  }
}
