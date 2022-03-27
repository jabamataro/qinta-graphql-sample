import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';

interface BankDetails {
  date: Date;
  first_name: string;
  last_name: string;
  transaction_id: string;
  transaction_type: string;
  transaction_value: Number;
}

interface User {
  id: string;
  name: string;
}

interface Response {
  bank1: BankDetails[];
  user: User[];
}

const GET_BANK_DETAILS = gql`
  query getBankDetails {
    bank1 {
      date
      first_name
      last_name
      transaction_id
      transaction_type
      transaction_value
      __typename
    }
  }
`;

const GET_USER = gql`
  query getUser {
    user {
      id
      name
    }
  }
`;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'qinta-graphql-sample';

  bpi: Observable<BankDetails[]>;
  users: Observable<User[]>;

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.users = this.apollo
      .watchQuery<Response>({
        query: GET_USER,
      })
      .valueChanges.pipe(map((result) => result.data.user));
    this.bpi = this.apollo
      .watchQuery<Response>({
        query: GET_BANK_DETAILS,
      })
      .valueChanges.pipe(map((result) => result.data.bank1));
  }
}
