import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  first_name : string = "";
  last_name : string = "";
  skill : string = "";
  toggle : boolean = false;
  image_toggle : boolean = true;
  no_candidates_found : boolean = false;

  constructor(
    private httpClient: HttpClient,
    private fb : FormBuilder
  ) { }

  ngOnInit(): void {
  }

  /*candidate search */
  searchCandidate(){
    if(this.first_name === '' && this.last_name === '' && this.skill === ''){
      alert('empty fields are not allowed');
    }else{
      this.toggle = true;
      this.image_toggle = false;

      const searchURL = 'http://localhost:8080/candidates/search?first_name=' + this.first_name+'&last_name='+this.last_name+'&skill='+this.skill;
 
      this.httpClient.get(searchURL).pipe(catchError(this.handleError))
        .subscribe((results) => {
          let res = Object.entries(results);
          this.no_candidates_found = false;
          document.getElementById('show_result').innerHTML = '';
  
          console.log('testttt');
          console.log(res.length);
          if(res.length === 0){
            var div = document.createElement('div');
            div.classList.add('alert');
            div.classList.add('alert-info');
            div.classList.add('home_empty_search');
  
            var h4 = document.createElement('h4');
            h4.classList.add('h4');
            var i = document.createElement('i');
            i.textContent = 'no matching candidates found';
  
            h4.appendChild(i);
            div.appendChild(h4);
            document.getElementById('show_result').appendChild(div);
  
          }else{
            /* found matching candidates */
  
            let title = document.createElement('h2');
            title.classList.add('h2');
            let i = document.createElement('i');
            i.textContent = 'candidate(s) found';
            title.appendChild(i);
            document.getElementById('show_result').appendChild(title);
  
            res.forEach((value) => {
              console.log(value);
              let container = document.createElement('div');
              container.setAttribute('class','container');
              
              let hr = document.createElement('hr');
              container.appendChild(hr);
              let name = document.createElement('p');
              name.textContent = 'Name : ' + value[1]['first_name'] + ' ' + value[1]['last_name']; 
              container.appendChild(name);
    
              let email = document.createElement('p');
              email.textContent = 'Email : ' + value[1]['email']; 
              container.appendChild(email);
    
              let phone = document.createElement('p');
              phone.textContent = 'Phone : ' + value[1]['phone']; 
              container.appendChild(phone);
    
              let date_of_birth= document.createElement('p');
              date_of_birth.textContent = 'Date of birth : ' + value[1]['year_of_birth'] + '-' +value[1]['month_of_birth'] + '-' + value[1]['day_of_birth'];
              container.appendChild(date_of_birth);
    
              let skills = document.createElement('div');
              skills.setAttribute('class','container');
    
              let msg = document.createElement('p');
              msg.textContent = 'skills:';
    
              skills.appendChild(msg);
    
              /* adding skills */
              var ul = document.createElement('ul');
              
              console.log('test');
              
              for(let i = 0; i < value[1]['skills'].length; i++){
                console.log(value[1]['skills'][i]);
    
                let li = document.createElement('li');
                li.textContent = value[1]['skills'][i]['name'] + ' - ' + value[1]['skills'][i]['description'];
                ul.appendChild(li);
              }
    
              container.appendChild(ul);
              container.appendChild(hr);
    
              this.toggle = false;
              document.getElementById('show_result').appendChild(container);
            });
          }
        });
     }
  }

  handleError(error: HttpErrorResponse) {
    
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
    this.toggle = false;
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
      
  };

}
