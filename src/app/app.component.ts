import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { elementAt, map, Observable } from 'rxjs';

interface Bank1Details {
  date: Date;
  transaction_id: string;
  transaction_type: string;
  transaction_value: number;
  user: User;
}

interface Bank2Details {
  date: Date;
  transaction_id: string;
  transaction_type: string;
  transaction_value: number;
  user: User;
}

interface User {
  user_id: string;
  first_name: string;
  last_name: string;
}

interface Response {
  bank1: Bank1Details[];
  bank2: Bank2Details[];
}

const GET_BANK1_DETAILS = gql`
  query getBank1Details {
    bank1 {
      date
      transaction_id
      transaction_type
      transaction_value
      user {
        first_name
        last_name
        user_id
      }
      user_id
    }
  }
`;

const GET_BANK2_DETAILS = gql`
  query getBank2Details {
    bank2 {
      date
      transaction_id
      transaction_type
      transaction_value
      user {
        first_name
        last_name
        user_id
      }
      user_id
    }
  }
`;

const ADD_BANK1_DETAILS = gql`
  mutation AddBank1Details(
    $user_id: uuid
    $transaction_value: Int
    $transaction_type: String
  ) {
    insert_bank1(
      objects: {
        user_id: $user_id
        transaction_value: $transaction_value
        transaction_type: $transaction_type
      }
    ) {
      returning {
        date
        transaction_id
        transaction_type
        transaction_value
        user {
          first_name
          last_name
          user_id
        }
      }
    }
  }
`;

const ADD_BANK2_DETAILS = gql`
  mutation AddBank2Details(
    $user_id: uuid
    $transaction_value: Int
    $transaction_type: String
  ) {
    insert_bank2(
      objects: {
        user_id: $user_id
        transaction_value: $transaction_value
        transaction_type: $transaction_type
      }
    ) {
      returning {
        date
        transaction_id
        transaction_type
        transaction_value
        user {
          first_name
          last_name
          user_id
        }
      }
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

  currentUser = 'Jaba Mataro';
  currentBank1Balance: number;
  currentBank2Balance: number;

  bank1: Observable<Bank1Details[]>;
  queryBank1Ref: QueryRef<Response>;
  bank2: Observable<Bank2Details[]>;
  queryBank2Ref: QueryRef<Response>;

  bank1Form: FormGroup;
  bank2Form: FormGroup;

  constructor(private apollo: Apollo, private fb: FormBuilder) {}

  ngOnInit(): void {
    // Create form for Bank 1
    this.bank1Form = this.fb.group({
      user_id: new FormControl(
        '474e9563-5673-4b7c-8c21-7005bc6a60e5',
        Validators.required
      ),
      transaction_value: new FormControl('', Validators.required),
      transaction_type: new FormControl('DEPOSIT', Validators.required),
    });

    // Create form for Bank 2
    this.bank2Form = this.fb.group({
      user_id: new FormControl(
        '474e9563-5673-4b7c-8c21-7005bc6a60e5',
        Validators.required
      ),
      transaction_value: new FormControl('', Validators.required),
      transaction_type: new FormControl('DEPOSIT', Validators.required),
    });

    this.getBank1();
    this.getBank2();
    this.computeCurrentBank1Balance();
    this.computeCurrentBank2Balance();
  }

  getBank1() {
    // Get Bank 1 Details
    this.queryBank1Ref = this.apollo.watchQuery<Response>({
      query: GET_BANK1_DETAILS,
    });
    this.bank1 = this.queryBank1Ref.valueChanges.pipe(
      map((result) => result.data.bank1)
    );
  }

  getBank2() {
    // Get Bank 2 Details
    this.queryBank2Ref = this.apollo.watchQuery<Response>({
      query: GET_BANK2_DETAILS,
    });
    this.bank2 = this.queryBank2Ref.valueChanges.pipe(
      map((result) => result.data.bank2)
    );
  }

  computeCurrentBank1Balance() {
    this.bank1.subscribe((val) => {
      this.currentBank1Balance = 0;
      val.forEach((element) => {
        if (element.transaction_type == 'DEPOSIT') {
          this.currentBank1Balance += element.transaction_value;
        } else {
          this.currentBank1Balance =
            this.currentBank1Balance - element.transaction_value;
        }
      });
    });
  }

  computeCurrentBank2Balance() {
    this.bank2.subscribe((val) => {
      this.currentBank2Balance = 0;
      val.forEach((element) => {
        if (element.transaction_type == 'DEPOSIT') {
          this.currentBank2Balance += element.transaction_value;
        } else {
          this.currentBank2Balance =
            this.currentBank2Balance - element.transaction_value;
        }
      });
    });
  }

  onAddBank1Details() {
    this.apollo
      .mutate({
        mutation: ADD_BANK1_DETAILS,
        variables: this.bank1Form.value,
      })
      .subscribe(
        ({ data }) => {
          this.queryBank1Ref.refetch();
          console.log('AppComponent -> onAddBank1Details -> data', data);
        },
        (error) => console.error('Error: ', error)
      );

    this.apollo
      .mutate({
        mutation: ADD_BANK2_DETAILS,
        variables: {
          user_id: '474e9563-5673-4b7c-8c21-7005bc6a60e5',
          transaction_value: this.bank1Form.get('transaction_value')?.value,
          transaction_type: 'WITHDRAWAL',
        },
      })
      .subscribe(
        ({ data }) => {
          this.queryBank2Ref.refetch();
          console.log('AppComponent -> onAddBank1Details -> data', data);
        },
        (error) => console.error('Error: ', error)
      );
  }

  onAddBank2Details() {
    this.apollo
      .mutate({
        mutation: ADD_BANK2_DETAILS,
        variables: this.bank2Form.value,
      })
      .subscribe(
        ({ data }) => {
          this.queryBank2Ref.refetch();
          console.log('AppComponent -> onAddBank1Details -> data', data);
        },
        (error) => console.error('Error: ', error)
      );

    this.apollo
      .mutate({
        mutation: ADD_BANK1_DETAILS,
        variables: {
          user_id: '474e9563-5673-4b7c-8c21-7005bc6a60e5',
          transaction_value: this.bank2Form.get('transaction_value')?.value,
          transaction_type: 'WITHDRAWAL',
        },
      })
      .subscribe(
        ({ data }) => {
          this.queryBank1Ref.refetch();
        },
        (error) => console.error('Error: ', error)
      );
  }
}
