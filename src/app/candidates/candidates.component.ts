import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Component, ErrorHandler, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class Skill{
  constructor(
    public id : number,
    public name : string,
    public description : string,
  ){}
}

export class Candidate{
  constructor(
    public id : number,
    public first_name : string,
    public last_name : string,
    public email : string,
    public phone : string,
    public year_of_birth : number,
    public month_of_birth : number,
    public day_of_birth : number,
    public skills : Skill[]
  ){}
}

@Component({
  selector: 'app-candidates',
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.css']
})
export class CandidatesComponent implements OnInit {

  candidates : Candidate[] | undefined;
  closeResult: string | undefined;
  toggle : boolean = false;
  editForm : FormGroup |undefined;
  editSkills : FormGroup |undefined;
  deleteId : number;
 
  constructor(
     private httpClient: HttpClient,
     private modalService: NgbModal,
     private fb : FormBuilder

  ) {}


  ngOnInit(): void {
    this.getCandidates(); 

    this.editSkills = this.fb.group({
      id: [''],
      name: [''],
      description: [''],
    
    });

    this.editForm = this.fb.group({
      id: [''],
      first_name: [''],
      last_name: [''],
      email: [''],
      phone: [''],
      year_of_birth: [''],
      month_of_birth: [''],
      day_of_birth: ['']

    });
  }

  getCandidates(){
      this.toggle = true;
      this.httpClient.get<any>('http://localhost:8080/candidates').subscribe(
         response => {
           this.toggle = false;
          console.log(response);
          if(response.length > 0){
            this.candidates = response;
            document.getElementById('table').style.display = 'table';
            document.getElementById('empty_records_message').style.display = 'none';
          }else{
            document.getElementById('table').style.display = 'none';
            document.getElementById('empty_records_message').style.display = 'block';
          }
         }
      );
  }

  open(content: any) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  onSubmit(f: NgForm) {
    if(f.value.first_name === '' || f.value.last_name === '' || f.value.email === '' ||
       f.value.phone === '' || f.value.year_of_birth === '' || f.value.month_of_birth === '' ||
       f.value.day_of_birth === ''){
      alert("empty fields are not allowed");
    }else{
      const url = 'http://localhost:8080/candidate/addCandidate';
      this.httpClient.post(url, f.value).pipe(catchError(this.handleError))
        .subscribe((result) => {
          this.ngOnInit(); //reload the table
        });
      this.modalService.dismissAll(); //dismiss the modal
    }
  }

  onSubmitSkill(){
    //add new skill to candidate
    if(this.editSkills.value.name === '' || this.editSkills.value.description === ''){
      alert('empty fields are not allowed');
    }else{
     
      const url = 'http://localhost:8080/candidate/' + this.editSkills.value.id + '/addSkill';
          
        this.httpClient.post(url, this.editSkills.value).pipe(catchError(this.handleError))
        .subscribe((result) => {
          this.ngOnInit(); //reload the table
        });
        
      this.modalService.dismissAll(); //dismiss the modal
        
      }
  }


  handleError(error: HttpErrorResponse) {
    this.toggle = false;
    alert("Could not complete request, please try again later.");
    
    if (error.error instanceof ErrorEvent) {

      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,

      
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };

  openSkills(targetModal: any, candidate: Candidate) {
    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static'
   });
   this.editSkills.patchValue( {
    id: candidate.id,  
   });
     

    candidate.skills.forEach((value) => {
      
      
      var p = document.createElement('p');
      var ul = document.createElement('ul');

      var li = document.createElement('li');
      li.textContent = `(skill) ${value.name} - ${value.description}`;

      ul.appendChild(li);
          
      var form = document.createElement('form');
      var input_id = document.createElement('input');
      input_id.setAttribute('type' , 'hidden');
      input_id.setAttribute('value', String(value.id));

      var submit = document.createElement('button');
      submit.setAttribute('class','btn btn-primary');
      submit.setAttribute('value',String(value.id));

      submit.textContent ='delete';


      submit.addEventListener('click', (e) => {
        this.deleteSkill(candidate.id, value.id);
       });

      form.appendChild(input_id);
      form.appendChild(submit);
      var li_delete = document.createElement('li');
      li_delete.appendChild(form);
      ul.appendChild(li_delete);
      document.getElementById('content')?.appendChild(ul);
      

    });
 }

  /*delete a skill from a candidate  */
 deleteSkill(candidateId : number, skillId : number){
  const url = 'http://localhost:8080/candidate/' + candidateId + '/deleteSkill/' + skillId;
  let params = new HttpParams();
  params = params.append('candidateId', String(candidateId));
  params = params.append('skillId', String(skillId));

  this.httpClient.delete(url, {params}).pipe(catchError(this.handleError))
  .subscribe((result) => {
    this.ngOnInit(); //reload the table
  });
 }


 openEdit(targetModal: any, candidate: Candidate) {
  this.modalService.open(targetModal, {
   centered: true,
   backdrop: 'static'
 });
  this.editForm.patchValue( {
    id: candidate.id, 
    first_name: candidate.first_name,
    last_name: candidate.last_name,
    phone: candidate.phone,
    email: candidate.email,
    year_of_birth: candidate.year_of_birth,
    month_of_birth: candidate.month_of_birth,
    day_of_birth: candidate.day_of_birth,
   });
 }

 onChange() {
  const editURL = 'http://localhost:8080/candidate/' + this.editForm.value.id + '/edit';
  this.httpClient.put(editURL, this.editForm.value)
    .subscribe((results) => {
      this.ngOnInit();
      this.modalService.dismissAll();
    });
  }  

  openDelete(targetModal, candidate: Candidate) {
    this.deleteId = candidate.id;
    this.modalService.open(targetModal, {
      backdrop: 'static',
      size: 'lg'
    });
  }

  onDelete() {
    const deleteURL = 'http://localhost:8080/candidate/' + this.deleteId + '/delete';
    this.httpClient.delete(deleteURL).pipe(catchError(this.handleError))
      .subscribe((results) => {
        this.ngOnInit();
        this.modalService.dismissAll();
      });
      this.modalService.dismissAll(); //dismiss the modal
  }
  
}
