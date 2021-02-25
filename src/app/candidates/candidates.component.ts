import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';

export class Candidate{
  constructor(
    public id : number,
    public first_name : string,
    public last_name : string,
    public email : string,
    public phone : string,
    public year_of_birth : number,
    public month_of_birth : number,
    public day_of_birth : number
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
 
  constructor(
     private httpClient: HttpClient,
     private modalService: NgbModal,
    

  ) { }

  ngOnInit(): void {
    this.getCandidates();
  }

  getCandidates(){
      this.toggle = true;
      this.httpClient.get<any>('http://localhost:8080/candidates').subscribe(
         response => {
           this.toggle = false;
          console.log(response);
          this.candidates = response;

         }
      );
      this.toggle = false;
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
    const url = 'http://localhost:8080/candidate/addCandidate';
    console.log('test');
    console.log(f.form.get('email'));
    console.log(f.value);
    this.httpClient.post(url, f.value)
      .subscribe((result) => {
        this.ngOnInit(); //reload the table
      });
    this.modalService.dismissAll(); //dismiss the modal
  }
}
