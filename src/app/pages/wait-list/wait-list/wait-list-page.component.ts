import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TrackEventsService } from 'app/shared/services/track-events.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Clipboard } from "@angular/cdk/clipboard"
import Swal from 'sweetalert2';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ApiDx29ServerService } from 'app/shared/services/api-dx29-server.service';
import { PrivacyPolicyPageComponent } from 'app/pages/content-pages/privacy-policy/privacy-policy.component';

@Component({
  selector: 'app-wait-list-page',
  templateUrl: './wait-list-page.component.html',
  styleUrls: ['./wait-list-page.component.scss'],
  providers: [ApiDx29ServerService]
})

export class WaitListPageComponent implements OnInit, OnDestroy {
  contactForm: FormGroup;
  submitPressed = false;  // Añade esta línea
  sending: boolean = false;
  modalReference: NgbModalRef;
  @ViewChild('section1', { static: false }) section1: ElementRef;
  @ViewChild('section2', { static: false }) section2: ElementRef;

  private subscription: Subscription = new Subscription();

  nothingFoundDisease: boolean = false;
  searchDiseaseField: string = '';
  callListOfDiseases: boolean = false;

  loadedItems: Boolean = false;
  haveInfo: Boolean = false;
  disease: any = { "id": "", "name": "", "items": [], "userId": "" };
  previewdisease: any = { "id": "", "name": "", "items": [], "userId": "" };
  searchSubject = new Subject<string>();
  listOfFilteredDiseases: any = [];
  showButtonCreateList: boolean = false;
  callListOfDiseases2: boolean = false;
  listOfFilteredDiseases2: any = [];
  actualInfoOneDisease: any = {};
  selectedDiseaseIndex: number = -1;
  gettingItems: boolean = false;
  fullNameInputValue: string = '';
  
  constructor(public translate: TranslateService, public trackEventsService: TrackEventsService, private clipboard: Clipboard, private fb: FormBuilder, public toastr: ToastrService, private modalService: NgbModal, private apiDx29ServerService: ApiDx29ServerService, private router: Router) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchText => this.loadItemsFromDatabase(searchText));
  }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.maxLength(1500)]]
    });
  }


  scrollToSection(sectionIndex: number) {
    const sections = [this.section1, this.section2];
    sections[sectionIndex].nativeElement.scrollIntoView({ behavior: 'smooth' });

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  share() {
    this.clipboard.copy('https://nav29.org');
    Swal.fire({
      icon: 'success',
      html: this.translate.instant("generics.Copied to the clipboard"),
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: false
    })

    setTimeout(function () {
      Swal.close();
    }, 2000);
  }


  onKey2(event: any): void {
    this.haveInfo = false;
    // Emite el valor actual del campo de búsqueda
    this.searchSubject.next(this.searchDiseaseField);
  }

  loadItemsFromDatabase(searchText: string): void {
    this.showButtonCreateList = false;
    if (!searchText) {
      // Manejar el estado cuando no hay texto
      return;
    }
    this.disease = { "id": "", "name": "", "items": [], "userId": ""};
    this.callListOfDiseases = true;
    this.listOfFilteredDiseases = [];
    this.apiDx29ServerService.searchItems(searchText)
      .subscribe((res: any) => {
        this.callListOfDiseases = false;
        console.log(res)
        if (res.diseases) {
          this.listOfFilteredDiseases = res.diseases;
        } else {
          this.showButtonCreateList = true;
          this.listOfFilteredDiseases = [];
        }
      }, (err) => {
        this.callListOfDiseases = false;
        this.listOfFilteredDiseases = [];
        // Manejar errores aquí
        // ...
      });
  }

  generateTheList(panelPreviewList) {
    
    if (this.modalReference != undefined) {
      this.modalReference.close()
    }
    
    setTimeout(() => {
      this.searchDiseases(this.searchDiseaseField, panelPreviewList);
    }, 200);
    
  }

  searchDiseases(searchText: string, panelPreviewList) {
    this.callListOfDiseases2 = true;
        var tempModelTimp = searchText.trim();
        var info = {
            "text": tempModelTimp,
            "lang": 'en'
        }
        this.subscription.add(this.apiDx29ServerService.searchDiseases(info)
            .subscribe((res: any) => {
              console.log(res)
                this.callListOfDiseases2 = false;
                if(res==null){
                    this.nothingFoundDisease = true;
                    this.listOfFilteredDiseases2 = [];
                }else{
                    this.nothingFoundDisease = false;
                    this.listOfFilteredDiseases2 = res;
                    if(this.listOfFilteredDiseases2.length == 0){
                        this.nothingFoundDisease = true;
                    }
                }
                this.previewdisease = {};
                let ngbModalOptions: NgbModalOptions = {
                  windowClass: 'ModalClass-lg'// xl, lg, sm
                };
                this.modalReference = this.modalService.open(panelPreviewList, ngbModalOptions);
                this.fullNameInputValue = searchText;
                
            }, (err) => {
                console.log(err);
                this.nothingFoundDisease = false;
                this.callListOfDiseases2 = false;
            }));
  }

  showMoreInfoDiagnosePopup(index){
    this.gettingItems = true;
    if(index)
    {
      this.selectedDiseaseIndex = index;
      this.actualInfoOneDisease = this.listOfFilteredDiseases2[this.selectedDiseaseIndex];
    }else{
      this.selectedDiseaseIndex = -1;
      this.actualInfoOneDisease = {id: '', name: this.fullNameInputValue};
    }

  var info = {
    "id": this.actualInfoOneDisease.id,
    "name": this.actualInfoOneDisease.name
  }
  this.subscription.add(this.apiDx29ServerService.previewDisease( info)
    .subscribe((res: any) => {
      this.gettingItems = false;
      console.log(res)
      if(res.disease.items.length > 0){
        this.searchDiseaseField = this.actualInfoOneDisease.name;
        this.previewdisease = res.disease;
        this.listOfFilteredDiseases2 = [];
      }else{
        this.toastr.error('No information found');
      }
     
      
    }, (err) => {
      console.log(err);
      this.gettingItems = false;
    }));
  }

  goToLogin() {
    if (this.modalReference != undefined) {
      this.modalReference.close()
    }
    this.router.navigate(['/login']);
  }

  selectDisease(index) {
    this.disease = this.listOfFilteredDiseases[index];
    if (this.disease.items.length > 0) {
      this.haveInfo = true;
      //this.router.navigate(['/conditions', this.disease.id]);  
      this.router.navigate(['/conditions'], { queryParams: { id: this.disease.id } });

    } else {
      this.haveInfo = false;
    }
    this.clearsearchDiseaseField();
    //wait 500ms to scroll to section 2
    setTimeout(() => {
      this.scrollToSection(1);
    }, 200);
  }

  clearsearchDiseaseField() {
    this.searchDiseaseField = "";
    this.listOfFilteredDiseases = [];
    this.callListOfDiseases = false;
  }

  onKey(event: KeyboardEvent) {
    this.nothingFoundDisease = false;
    this.loadedItems = false;
    this.haveInfo = false;
    this.disease = { "id": "", "name": "", "items": [], "userId": ""};
  }

  openPolicy() {
    let ngbModalOptions: NgbModalOptions = {
      windowClass: 'ModalClass-lg'// xl, lg, sm
    };
    this.modalReference = this.modalService.open(PrivacyPolicyPageComponent, ngbModalOptions);
  }

  closeModal() {
    if (this.modalReference != undefined) {
      this.modalReference.close()
    }
  }
  openContactForm(content) {
    this.modalReference = this.modalService.open(content);
  }

  get f() { return this.contactForm.controls; }

  onSubmit() {
    if (this.contactForm.invalid) {

      // Si el formulario es inválido, detén la ejecución y muestra errores.
      return;
    } else {
      this.sending = true;
      this.subscription.add(this.apiDx29ServerService.sendMsgValidator(this.disease.userId, this.contactForm.value)
        .subscribe((res: any) => {
          this.sending = false;
          this.toastr.success('Message sent successfully');
          if (this.modalReference != undefined) {
            this.modalReference.close()
          }
          //reset form
          setTimeout(() => {
            if (this.contactForm) {
              this.contactForm.reset();
            } else {
                console.error('Intento de resetear un formulario no inicializado.');
            }
          }, 500); // espera 500 milisegundos antes de resetear el formulario
          /*this.contactForm.patchValue({
            email: '',
            subject: '',
            message: ''
          })*/
        }, (err) => {
          console.log(err);
          this.sending = false;
          this.toastr.error('Error sending message');
        }));
    }
    console.log(this.contactForm.value);
    // Aquí implementas la lógica de envío, como enviar a un backend.
  }

}
