import { Component, OnInit, OnDestroy } from '@angular/core';
import { animate, keyframes, style, transition, trigger, state } from '@angular/animations';
import * as kf from 'app/user/home/keyframes';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { DragulaService } from 'ng2-dragula';
import { AuthService } from 'app/shared/auth/auth.service';
import { ApiDx29ServerService } from 'app/shared/services/api-dx29-server.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('fadeSlideInOut', [
      transition(':enter', [
        animate('500ms', style({ opacity: 1, transform: 'rotateY(180deg)' })),
      ]),
      transition(':leave', [
        animate('500ms', style({ opacity: 0, transform: 'rotateY(180deg)'})),
      ]),
    ]),
    trigger('cardAnimation', [
      //transition('* => wobble', animate(1000, keyframes (kf.wobble))),
      transition('* => swing', animate(1000, keyframes(kf.swing))),
      //transition('* => jello', animate(1000, keyframes (kf.jello))),
      //transition('* => zoomOutRight', animate(1000, keyframes (kf.zoomOutRight))),
      transition('* => slideOutLeft', animate(1000, keyframes(kf.slideOutRight))),
      transition('* => slideOutRight', animate(1000, keyframes(kf.slideOutLeft))),
      //transition('* => rotateOutUpRight', animate(1000, keyframes (kf.rotateOutUpRight))),
      transition('* => fadeIn', animate(1000, keyframes(kf.fadeIn))),
    ]),
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  providers: [ApiDx29ServerService]
})

export class HomeComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  idUser: string;
  orphacode: string;
  loadedItems: Boolean = false;
  haveInfo: Boolean = false;
  trash = [];
  newItemName: string = '';
  disease: any = { "id": "", "name": "", "items": []} ;

  constructor(public translate: TranslateService, public toastr: ToastrService, private dragulaService: DragulaService, private authService: AuthService, private apiDx29ServerService: ApiDx29ServerService) {
    this.idUser = this.authService.getIdUser()
    this.orphacode = this.authService.getOrphacode()
  }

  setupDragula() {
    this.dragulaService.createGroup("ITEMS", {
      moves: (el, container, handle) => {
        return handle.classList.contains('handle');
      }
    });

    this.dragulaService.drop("ITEMS").subscribe(({ name, el, target, source, sibling }) => {
      this.updateListItemsOrder();
    });
  }

  updateListItemsOrder() {
    // Aquí actualizas el orden de 'items' para reflejar el orden en la UI
    let newOrder = Array.from(document.querySelectorAll('.list-group-item'))
                        .map(item => item.querySelector('.item-content').textContent.trim());
    this.disease.items.sort((a, b) => newOrder.indexOf(a.name) - newOrder.indexOf(b.name));
  }

  addNewItem() {
    if (this.newItemName.trim()) {
      const newItem = { name: this.newItemName.trim() }; // Crea el objeto del nuevo elemento
      this.disease.items.push(newItem); // Añade el nuevo elemento a la lista

      this.newItemName = ''; // Limpia el campo de entrada
    }
  }

  removeItem(item) {

    Swal.fire({
      title: this.translate.instant("generics.Are you sure?"),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0CC27E',
      cancelButtonColor: '#FF586B',
      confirmButtonText: this.translate.instant("generics.Delete"),
      cancelButtonText: this.translate.instant("generics.No, cancel"),
      showLoaderOnConfirm: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.value) {
        this.confirmDelete(item);
      }
    });

    
  }

  confirmDelete(item) {
    const index = this.disease.items.indexOf(item);
    if (index !== -1) {
      this.disease.items.splice(index, 1);
      // Aquí puedes agregar código adicional para manejar la eliminación en tu backend
    }
  }


  async ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.dragulaService.destroy("ITEMS");
  }

  async ngOnInit() {
    this.loadItemsFromDatabase();
    this.setupDragula();
  }

  loadItemsFromDatabase() {
    this.subscription.add(this.apiDx29ServerService.getItems(this.orphacode)
      .subscribe((res: any) => {
        console.log(res)
        if(res.disease){
          this.disease = res.disease;
          this.haveInfo = true;
          this.loadedItems = true;
        }else{
          console.log('entra')
          this.loadedItems = true;
          this.haveInfo = false;
          this.disease = { "id": "", "name": "", "items": []} ;
        }
      }, (err) => {
        console.log(err);
      }));
  }

  saveItems() {
    var info = {
      "items": this.disease.items
    }
    this.subscription.add(this.apiDx29ServerService.saveItems(this.disease._id , info)
      .subscribe((res: any) => {
        this.toastr.success('', this.translate.instant("generics.Data saved successfully"));
      }, (err) => {
        console.log(err);
      }));

  }
  

    
}
