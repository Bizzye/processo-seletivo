import { TestBed } from '@angular/core/testing';

import { App } from './app';

describe('App', () => {
  beforeEach(() => {
    jasmine.clock().install();
    TestBed.configureTestingModule({ imports: [App] });
  });

  afterEach(() => jasmine.clock().uninstall());

  it('renderiza a contagem regressiva dentro do landmark principal', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('main app-contagem-regressiva')).not.toBeNull();
    expect(elemento.querySelector('h1')?.textContent).toContain('Black Friday');

    fixture.destroy();
  });
});
