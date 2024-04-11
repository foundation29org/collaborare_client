import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiDx29ServerService } from 'app/shared/services/api-dx29-server.service';
import { AuthService } from 'app/shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

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

  profileForm = new FormGroup({
    organization: new FormControl('', [Validators.required]),
    contactEmail: new FormControl('', [Validators.required, Validators.email]),
    web: new FormControl('', [Validators.pattern('https?://.+')]),
  });

  constructor(private apiDx29ServerService: ApiDx29ServerService, private authService: AuthService, public toastr: ToastrService, private router: Router) { 
    this.getProfile();
  }

  getProfile() {
    console.log(this.profileForm.value);
    this.subscription.add(this.apiDx29ServerService.getProfile(this.authService.getIdUser())
        .subscribe((res: any) => {
            console.log(res)
            if (res && res.user) {
                this.profileForm.patchValue({
                    organization: res.user.organization || '',
                    web: res.user.web || '',
                    contactEmail: res.user.contactEmail || ''
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
      }
  }
}
