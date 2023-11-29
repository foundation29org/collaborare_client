import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TrackEventsService } from 'app/shared/services/track-events.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Clipboard } from "@angular/cdk/clipboard"
import Swal from 'sweetalert2';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ApiDx29ServerService } from 'app/shared/services/api-dx29-server.service';

@Component({
  selector: 'app-wait-list-page',
  templateUrl: './wait-list-page.component.html',
  styleUrls: ['./wait-list-page.component.scss'],
  providers: [ApiDx29ServerService]
})

export class WaitListPageComponent implements OnInit, OnDestroy {
  myForm: FormGroup;
  submitPressed = false;  // Añade esta línea
  sending: boolean = false;
  modalReference: NgbModalRef;
  @ViewChild('section1', { static: false }) section1: ElementRef;
  @ViewChild('section2', { static: false }) section2: ElementRef;
  private currentSectionIndex = 0;
  private blockScroll = false;

  private subscription: Subscription = new Subscription();

  nothingFoundDisease: boolean = false;
  searchDiseaseField: string = '';
  callListOfDiseases: boolean = false;

  loadedItems: Boolean = false;
  haveInfo: Boolean = false;
  disease: any = { "id": "", "name": "", "items": []} ;
  searchSubject = new Subject<string>();
  listOfFilteredDiseases: any = [];
  constructor(public translate: TranslateService, public trackEventsService: TrackEventsService, private clipboard: Clipboard, private fb: FormBuilder, public toastr: ToastrService, private modalService: NgbModal, private apiDx29ServerService: ApiDx29ServerService) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchText => this.loadItemsFromDatabase(searchText));
  }

  ngOnInit(): void {
    this.myForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      userType: ['', Validators.required]
    });
  }


  scrollToSection(sectionIndex: number) {
    this.blockScroll = true;
    const sections = [this.section1, this.section2];
    sections[sectionIndex].nativeElement.scrollIntoView({ behavior: 'smooth' });
  
    setTimeout(() => {
      this.blockScroll = false;
    }, 1000);
  }


  @HostListener('window:wheel', ['$event'])
onWindowScroll(event) {
  if (this.blockScroll) return;
  if (event.deltaY > 0) {
    this.currentSectionIndex++;
  } else {
    this.currentSectionIndex--;
  }

  this.currentSectionIndex = Math.max(0, Math.min(this.currentSectionIndex, 2 - 1));
  this.scrollToSection(this.currentSectionIndex);
}

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  share(){
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
    // Emite el valor actual del campo de búsqueda
    this.searchSubject.next(this.searchDiseaseField);
  }
  
  loadItemsFromDatabase(searchText: string): void {
    if (!searchText) {
      // Manejar el estado cuando no hay texto
      return;
    }
    this.disease = { "id": "", "name": "", "items": []} ;
    this.callListOfDiseases = true;
    this.listOfFilteredDiseases = [];
    this.apiDx29ServerService.searchItems(searchText)
      .subscribe((res: any) => {
        this.callListOfDiseases = false;
        console.log(res)
        if(res.diseases){
          this.listOfFilteredDiseases = res.diseases;
        }else{
          this.listOfFilteredDiseases = [];
        }
      }, (err) => {
        this.callListOfDiseases = false;
        this.listOfFilteredDiseases = [];
        // Manejar errores aquí
        // ...
      });
  }

  selectDisease(index){
    this.disease = this.listOfFilteredDiseases[index];
    this.clearsearchDiseaseField();
  }

  clearsearchDiseaseField(){
    this.searchDiseaseField = "";
    this.listOfFilteredDiseases = [];
    this.callListOfDiseases = false;
  }

  loadItemsFromDatabase2() {
    if(this.searchDiseaseField == '') return;
    if(this.searchDiseaseField.indexOf('ORPHA:')==-1){
      this.searchDiseaseField = 'ORPHA:'+this.searchDiseaseField;
    }
    this.callListOfDiseases = true;
    this.subscription.add(this.apiDx29ServerService.getItems(this.searchDiseaseField)
      .subscribe((res: any) => {
        console.log(res)
        if(res.disease){
          this.disease = res.disease;
          this.haveInfo = true;
          this.loadedItems = true;
        }else{
          console.log('entra')
          this.nothingFoundDisease = true;
          this.loadedItems = true;
          this.haveInfo = false;
          this.disease = { "id": "", "name": "", "items": []} ;
        }
        this.callListOfDiseases = false;
      }, (err) => {
        console.log(err);
        this.callListOfDiseases = false;
      }));
  }

  onKey(event: KeyboardEvent) {
    this.nothingFoundDisease = false;
    this.loadedItems = false;
    this.haveInfo = false;
    this.disease = { "id": "", "name": "", "items": []} ;
  }

  openPolicy(policyPanel){
      let ngbModalOptions: NgbModalOptions = {
            windowClass: 'ModalClass-lg'// xl, lg, sm
      };
      this.modalReference = this.modalService.open(policyPanel, ngbModalOptions);
  }

  closeModal() {
    if (this.modalReference != undefined) {
        this.modalReference.close()
    }
} 

}
