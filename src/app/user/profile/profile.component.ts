import { Component } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiDx29ServerService } from 'app/shared/services/api-dx29-server.service';
import { AuthService } from 'app/shared/auth/auth.service';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [ApiDx29ServerService]
})

export class ProfileComponent {
    private subscription: Subscription = new Subscription();
    submitted = false;
    loading = true;
    modalReference: NgbModalRef;

  profileForm = new FormGroup({
    organization: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
    contactEmail: new FormControl('', [Validators.required, Validators.email]),
    web: new FormControl('', [Validators.pattern(/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/[^\s]*)?$/)]),
    acceptTerms: new FormControl(false, [Validators.requiredTrue])
  });

  countries: any;
  openedTerms: boolean = false;

  constructor(private http: HttpClient, private apiDx29ServerService: ApiDx29ServerService, private authService: AuthService, public toastr: ToastrService, private router: Router, private modalService: NgbModal) { 
    
    this.loadCountries();
  }

  loadCountries(){
    this.subscription.add( this.http.get('assets/jsons/countries.json')
    .subscribe( (res : any) => {
      this.countries=res;
      this.getProfile();
    }, (err) => {
      console.log(err);
      this.getProfile();
    }));
  }
  
  getProfile() {
    this.subscription.add(this.apiDx29ServerService.getProfile(this.authService.getIdUser())
        .subscribe((res: any) => {
            console.log(res)
            if (res && res.validatorInfo) {
              if(res.validatorInfo.acceptTerms){
                this.openedTerms = true;
              }
                this.profileForm.patchValue({
                    organization: res.validatorInfo.organization || '',
                    country: res.validatorInfo.country || '',
                    web: res.validatorInfo.web || '',
                    contactEmail: res.validatorInfo.contactEmail || '',
                    acceptTerms: res.validatorInfo.acceptTerms || false
                });
            }
            this.loading = false;
        }, (err) => {
        console.log(err);
        this.loading = false;
        }));
  }

  onSubmit() {
    this.submitted = true; 
    // Aquí puedes agregar la lógica para procesar los datos del formulario
    if (this.profileForm.valid) {
        // Lógica para manejar el formulario válido
        console.log(this.profileForm.value);
        this.subscription.add(this.apiDx29ServerService.setProfile(this.authService.getIdUser(), this.profileForm.value)
            .subscribe((res: any) => {
                console.log(res)
                this.toastr.success('Profile updated successfully');
                //ir a la pagina home
                this.router.navigate(['/home']);
                this.submitted = false;
            }, (err) => {
            console.log(err);
            this.toastr.error('Error updating profile');
            this.submitted = false;
            }));
      }else{
        if(!this.openedTerms){
          Swal.fire({
            icon: 'info',
            title: 'You need to click and read the terms and conditions link before you can continue.',
            showConfirmButton: true,
          });
        }else if(this.profileForm.get('acceptTerms')?.invalid){
          Swal.fire({
            icon: 'info',
            title: 'Please check the box to accept the terms and conditions before proceeding.',
            showConfirmButton: true,
          });
        }else {
          Swal.fire({
            icon: 'info',
            title: 'Please fill in all the required fields before proceeding.',
            showConfirmButton: true,
          });
        }
      }
  }

  acceptConsent() {
    this.profileForm.patchValue({
      acceptTerms: true
    });
    this.closeModal();
  }

  showTerms(content) {
    this.openedTerms = true;
    let ngbModalOptions: NgbModalOptions = {
      keyboard: false,
      windowClass: 'ModalClass-sm' // xl, lg, sm
    };
    if (this.modalReference != undefined) {
      this.modalReference.close();
      this.modalReference = undefined;
    }
    this.modalReference = this.modalService.open(content, ngbModalOptions);
  }

  async closeModal() {

    if (this.modalReference != undefined) {
      this.modalReference.close();
      this.modalReference = undefined;
    }
  }
}
