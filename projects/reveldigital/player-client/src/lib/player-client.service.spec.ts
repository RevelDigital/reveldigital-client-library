import { TestBed } from '@angular/core/testing';

import { PlayerClientService } from './player-client.service';

describe('PlayerClientService', () => {
  let service: PlayerClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
