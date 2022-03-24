import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';

interface User {
  id: string;
  name: string;
}

interface Response {
  user: User[];
}

const GET_USERS = gql`
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

  users: Observable<User[]>;

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.users = this.apollo
      .watchQuery<Response>({
        query: GET_USERS,
      })
      .valueChanges.pipe(map((result) => result.data.user));
  }
}
