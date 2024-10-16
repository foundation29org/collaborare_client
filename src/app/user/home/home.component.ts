import { Component, OnInit, OnDestroy } from '@angular/core';
import { animate, keyframes, style, transition, trigger, state } from '@angular/animations';
import * as kf from 'app/user/home/keyframes';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AuthService } from 'app/shared/auth/auth.service';
import { ApiDx29ServerService } from 'app/shared/services/api-dx29-server.service';
import { CdkDragDrop, moveItemInArray, CdkDragStart } from '@angular/cdk/drag-drop';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

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
  loadedItems: Boolean = false;
  haveInfo: Boolean = false;
  trash = [];
  newItemName: string = '';
  disease: any = { "id": "", "name": "", "items": []} ;

  nothingFoundDisease: boolean = false;
  searchDiseaseField: string = '';
  actualInfoOneDisease: any = {};
  private subscriptionDiseasesCall: Subscription = new Subscription();
  private subscriptionDiseasesNotFound: Subscription = new Subscription();
  callListOfDiseases: boolean = false;
  listOfFilteredDiseases: any = [];
  selectedDiseaseIndex: number = -1;
  loadingOneDisease: boolean = false;
  gettingItems: boolean = false;
  bodyElement: HTMLElement = document.body;
  loading = false; 
  hasData = false;
  modalReference: NgbModalRef;
  editingIndex: number = -1;
  editingAspect: any = {};
  emails: string[] = [];
  newEmail: string = '';
  additionalComments: string = '';
  sending: boolean = false;
  
  constructor(public translate: TranslateService, public toastr: ToastrService, private authService: AuthService, private apiDx29ServerService: ApiDx29ServerService ,private modalService: NgbModal) {
    this.idUser = this.authService.getIdUser()
    this.getProfile();
  }

  getProfile() {
    this.subscription.add(this.apiDx29ServerService.getProfile(this.authService.getIdUser())
        .subscribe((res: any) => {
          console.log(res)
          if(res.message == "The user does not exis"){
            this.hasData = false;
          }else if(res && res.validatorInfo!=null){
            if(res.validatorInfo.organization && res.validatorInfo.organization != "" && res.validatorInfo.contactEmail && res.validatorInfo.contactEmail != ""){
                this.hasData = true;
            }else{
                this.hasData = false;
            }
          }
            this.loading = true;
        }, (err) => {
        console.log(err);
        this.loading = true;
        this.hasData = false;
        }));
  }

  drop(event: CdkDragDrop<string[]>) {
    this.bodyElement.classList.remove('inheritCursors');
    this.bodyElement.style.cursor = 'unset';
    moveItemInArray(this.disease.items, event.previousIndex, event.currentIndex);
  }

  dragStart(event: CdkDragStart) {
    this.bodyElement.classList.add('inheritCursors');
    this.bodyElement.style.cursor = 'grabbing';
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
      confirmButtonColor: '#F55252',
      cancelButtonColor: '#b0b6bb',
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
  }

  async ngOnInit() {
    this.loadItemsFromDatabase();
  }

  loadItemsFromDatabase() {
    this.subscription.add(this.apiDx29ServerService.getItems(this.authService.getIdUser())
      .subscribe((res: any) => {
        console.log(res)
        if(res.message=="The disease does not exist"){
          this.disease = { "id": "", "name": "", "items": []} ;
          this.loadedItems = true;
          this.haveInfo = false;
        }else if(res.disease.id != ""){
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

  updateItems() {
    var info = {
      "items": this.disease.items
    }
    this.subscription.add(this.apiDx29ServerService.updateItems(this.disease._id , info)
      .subscribe((res: any) => {
        //this.toastr.success('', this.translate.instant("generics.Data saved successfully"));
        Swal.fire({
          icon: 'success',
          title: 'Data saved successfully',
          showConfirmButton: true,
          html: `
            <p>Thanks for your contribution.</p>
            <p>To see how the list has been validated, <a href="javascript:void(0)" onclick="window.location.href='/conditions?id=${this.disease.id}'">click here</a>.</p>
            <div style="display: flex; justify-content: center; align-items: center; gap: 20px;">
              <img src="assets/img/logos/EURORDIS.webp" alt="EURORDIS logo" style="height: 75px;">
              <img src="assets/img/logos/Logo_ema2.webp" alt="EMA logo" style="height: 75px;">
            </div>
          `,
        });
      }, (err) => {
        console.log(err);
      }));

  }

  onKey(event: KeyboardEvent) {
    if(event.key ==='ArrowLeft' || event.key ==='ArrowUp' || event.key ==='ArrowRight' || event.key ==='ArrowDown'){

    }else{
        this.nothingFoundDisease = false;
        if (this.searchDiseaseField.trim().length > 3) {
            if (this.subscriptionDiseasesCall) {
                this.subscriptionDiseasesCall.unsubscribe();
            }
            if (this.subscriptionDiseasesNotFound) {
                this.subscriptionDiseasesNotFound.unsubscribe();
            }
            this.callListOfDiseases = true;
            var tempModelTimp = this.searchDiseaseField.trim();
            var info = {
                "text": tempModelTimp,
                "lang": 'en'
            }
            this.subscriptionDiseasesCall= this.apiDx29ServerService.searchDiseases(info)
                .subscribe((res: any) => {
                    this.callListOfDiseases = false;
                    if(res==null){
                        this.nothingFoundDisease = true;
                        this.listOfFilteredDiseases = [];
                    }else{
                        this.nothingFoundDisease = false;
                        this.listOfFilteredDiseases = res;
                        if(this.listOfFilteredDiseases.length == 0){
                            this.nothingFoundDisease = true;
                        }
                    }
                    
                }, (err) => {
                    console.log(err);
                    this.nothingFoundDisease = false;
                    this.callListOfDiseases = false;
                });
        } else {
            this.callListOfDiseases = false;
            this.listOfFilteredDiseases = [];
        }
    }
}

showMoreInfoDiagnosePopup(index){
  this.loadingOneDisease = true;
  if(index !== null && index !== undefined){
    this.selectedDiseaseIndex = index;
    this.actualInfoOneDisease = this.listOfFilteredDiseases[this.selectedDiseaseIndex];
  }else{
    this.selectedDiseaseIndex = -1;
    this.actualInfoOneDisease = {id: null, name: this.searchDiseaseField};
  }
  
  console.log(this.actualInfoOneDisease)
  Swal.fire({
      title: this.translate.instant("generics.Are you sure?"),
      html: '<p class="mt-2">You have selected: '+this.actualInfoOneDisease.name+'</p><p class="mt-2">'+this.actualInfoOneDisease.id+'</p>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F55252',
      confirmButtonText: 'Yes, I am sure.',
      cancelButtonColor: '#b0b6bb',
      cancelButtonText: this.translate.instant("generics.Cancel"),
      showLoaderOnConfirm: true,
      allowOutsideClick: false
  }).then((result) => {
      if (result.value) {
        this.gettingItems = true;
        this.saveItems();
        //this.cheackDisease(this.actualInfoOneDisease.id);
        this.loadingOneDisease = false;

      }
      this.clearsearchDiseaseField();
  });
  
}

cheackDisease(id) {
  this.gettingItems = true;
  this.subscription.add(this.apiDx29ServerService.selectDisease(id)
    .subscribe((res: any) => {
      console.log(res)
      /*if(res.disease){
        this.gettingItems = false;
        Swal.fire({
          title: 'We are sorry',
          html: '<p class="mt-2">This disease is already taken by another user</p>',
          icon: 'warning',
          showCancelButton: false,
          confirmButtonColor: '#b0b6bb',
          confirmButtonText: 'Ok',
          showLoaderOnConfirm: true,
          allowOutsideClick: false
        }).then((result) => {
            
        }
        );
      }else{
        this.saveItems();
      }*/
      this.saveItems();
    }, (err) => {
      console.log(err);
      this.gettingItems = false;
    }));
}

saveItems() {
  var info = {
    "id": this.actualInfoOneDisease.id,
    "name": this.actualInfoOneDisease.name,
    "synonyms": this.actualInfoOneDisease.synonyms
  }
  this.subscription.add(this.apiDx29ServerService.saveItems(this.authService.getIdUser(), info)
    .subscribe((res: any) => {
      this.gettingItems = false;
      console.log(res)
      if(res.message == "Data saved successfully"){
        //this.toastr.success('', this.translate.instant("generics.Data saved successfully"));  
        Swal.fire({
          icon: 'success',
          title: 'The key condition aspects have been generated. Review them, and edit what you think is necessary.',
          showConfirmButton: true,
        });
        this.loadItemsFromDatabase();
      }else{
        this.authService.logout();
      }
      
    }, (err) => {
      console.log(err);
      this.gettingItems = false;
    }));

}

focusOutFunctionDiseases(){
  //if (this.searchDiseaseField.trim().length > 3 && this.listOfFilteredDiseases.length==0 && !this.callListOfDiseases) {
  if (this.searchDiseaseField.trim().length > 3 && !this.callListOfDiseases) {
      //send text
    
  }
}

clearsearchDiseaseField(){
  this.searchDiseaseField = "";
  this.listOfFilteredDiseases = [];
  this.callListOfDiseases = false;
}
  
deleteDisease(){
  Swal.fire({
    title: this.translate.instant("generics.Are you sure?"),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#F55252',
    cancelButtonColor: '#b0b6bb',
    confirmButtonText: this.translate.instant("generics.Delete"),
    cancelButtonText: this.translate.instant("generics.No, cancel"),
    showLoaderOnConfirm: true,
    allowOutsideClick: false
  }).then((result) => {
    if (result.value) {
      this.confirmDeleteDisease();
    }
  });
}
confirmDeleteDisease(){
  var info = {
    "id": this.disease._id
  }

  this.subscription.add(this.apiDx29ServerService.deleteDisease(this.authService.getIdUser(), info)
    .subscribe((res: any) => {
      console.log(res)
      if(res.message == "Deleted disease successfully"){
        //this.toastr.success('', this.translate.instant("generics.Data saved successfully"));
        Swal.fire({
          icon: 'success',
          title: 'Deleted disease successfully',
          showConfirmButton: true,
        });
        this.loadItemsFromDatabase();
      }else{
        this.authService.logout();
      }
      
    }, (err) => {
      console.log(err);
    }));
}

openEditModal(aspect: { name: string }, index: number, editModal: any) {
  this.editingAspect = { ...aspect };
  this.editingIndex = index;
  let ngbModalOptions: NgbModalOptions = {
    windowClass: 'ModalClass-sm'// xl, lg, sm
  };
  this.modalReference = this.modalService.open(editModal, ngbModalOptions);

}

saveEdit() {
  if (this.editingIndex > -1) {
    this.disease.items[this.editingIndex] = { ...this.editingAspect };
    this.modalReference.close();
  }
}

openShareModal(shareModal) {
  this.emails = [];
  this.modalService.open(shareModal);
}

addEmail() {
  if (this.newEmail && this.validateEmail(this.newEmail)) {
    this.emails.push(this.newEmail);
    this.newEmail = '';
  }
}

removeEmail(index: number) {
  this.emails.splice(index, 1);
}

validateEmail(email: string) {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return re.test(email);
}

shareList() {
  if(this.emails.length == 0){
    Swal.fire({
      icon: 'error',
      title: 'Please enter at least one email address and click on Add button',
      showConfirmButton: true,
    });
    return;
  }
  this.sending = true; 

  const payload = {
    emails: this.emails,
    disease: this.disease,
    comments: this.additionalComments
  };

  this.subscription.add(this.apiDx29ServerService.shareDisease(this.authService.getIdUser(), payload)
  .subscribe((res: any) => {
    this.additionalComments = "";
    this.emails = [];
    this.sending = false;
    Swal.fire({
      icon: 'success',
      title: 'List shared successfully',
      showConfirmButton: true,
    });
    console.log('Lista compartida exitosamente');
    this.modalService.dismissAll();
  }, (err) => {
    console.log(err);
    this.sending = false;
  }));
}
    
}
