import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TrackEventsService } from 'app/shared/services/track-events.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Clipboard } from "@angular/cdk/clipboard"
import Swal from 'sweetalert2';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ApiDx29ServerService } from 'app/shared/services/api-dx29-server.service';
import { PrivacyPolicyPageComponent } from 'app/pages/content-pages/privacy-policy/privacy-policy.component';

@Component({
  selector: 'app-validated-conditions-page',
  templateUrl: './validated-conditions-page.component.html',
  styleUrls: ['./validated-conditions-page.component.scss'],
  providers: [ApiDx29ServerService]
})

export class ValidatedConditionsPageComponent implements OnInit, OnDestroy {
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
  disease: any = { "id": "", "name": "", "items": [] };
  listOfFilteredDiseases: any = [];
  searchText: string = '';
  constructor(public translate: TranslateService, public trackEventsService: TrackEventsService, private clipboard: Clipboard, private fb: FormBuilder, public toastr: ToastrService, private modalService: NgbModal, private apiDx29ServerService: ApiDx29ServerService) {
    this.loadItemsFromDatabase();
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


  loadItemsFromDatabase(): void {
    this.disease = { "id": "", "name": "", "items": [] };
    this.callListOfDiseases = true;
    this.listOfFilteredDiseases = [];
    this.apiDx29ServerService.validatedItems()
      .subscribe((res: any) => {
        this.callListOfDiseases = false;
        console.log(res)
        if (res.diseases) {
          this.listOfFilteredDiseases = res.diseases;
        } else {
          this.listOfFilteredDiseases = [];
        }
      }, (err) => {
        this.callListOfDiseases = false;
        this.listOfFilteredDiseases = [];
        // Manejar errores aquí
        // ...
      });
  }

  selectDisease(index) {
    this.disease = this.listOfFilteredDiseases[index];
    if (this.disease.items.length > 0) {
      this.haveInfo = true;
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
    this.disease = { "id": "", "name": "", "items": [] };
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
      this.subscription.add(this.apiDx29ServerService.sendMsgValidator(this.disease.id, this.contactForm.value)
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
