function checkIntegrationPackageData(
  typeOfData: 'Gateways' | 'Destinations',
  codeInput: string,
  statusInput: 'OPEN' | 'CLOSED',
  airportCodeInput?: string // optional vì chỉ cần cho Destinations
) {
  const expectedChecked = statusInput === 'OPEN' ? 'true' : 'false';

  // Hàm phụ để kiểm tra checkbox
  function checkCheckbox($row: JQuery<HTMLElement>, id: string, index: number) {
    cy.wrap($row).find(`div[id="${id}"]`).eq(index).then(($checkbox) => {
      expect($checkbox.attr('data-p-checked')).to.equal(expectedChecked);
    });
  }

  if (typeOfData === 'Gateways') {
    cy.get('[pc53=""] > .p-datatable-column-header-content > .p-datatable-filter > .p-button')
      .click({ force: true });

    cy.get('input[placeholder="Airport Code"]').type(codeInput);
    cy.get('button[aria-label="Apply"]').click({ force: true });
    cy.wait(2000);

    cy.get('div[class="city-table"]').should('be.visible').within(() => {
      cy.get('tr').eq(1).then(($row) => {
        cy.wrap($row).find('td').eq(0).should('have.text', codeInput);
        checkCheckbox($row, 'Package', 0);
      });
    });
  }

  if (typeOfData === 'Destinations') {
    if (!airportCodeInput) {
      throw new Error('airportCodeInput is required for Destinations');
    }

    cy.get('[pc89=""] > .p-datatable-column-header-content > .p-datatable-filter > .p-button')
      .click({ force: true });

    cy.get('input[placeholder="SV Dest ID"]').type(codeInput, {force:true});
    cy.get('button[aria-label="Apply"]').click({ force: true });
    cy.wait(2000);

    cy.get('div[class="city-table"]').should('be.visible').within(() => {
      cy.contains('td', airportCodeInput).closest('tr').then(($row) => {
        cy.wrap($row).find('td').eq(9).should('have.text', codeInput);
        checkCheckbox($row, 'Package', 1);
        checkCheckbox($row, 'Hotel', 1);
      });
    });
  }
}

describe('Kiểm tra intergrated data', () => {
    const MOCK_DATA_GATEWAYS:any = require('../../fixtures/GQT/gateways.json');
    const GATEWAYS = MOCK_DATA_GATEWAYS.map((gateway: any) => ({
        code: gateway.code,
        status: gateway.status
    }));

    const MOCK_DATA_DESTINATIONS:any = require('../../fixtures/GQT/destinations.json');
    const DESTINATIONS = MOCK_DATA_DESTINATIONS.map((destination: any) => ({
        airportCode:destination.airportCode,
        code: destination.code,
        status: destination.status
    }));

    //Authentication steps: Lưu cookies/session để sử dụng lại trong các test khác.
    beforeEach('Authentication steps', () => {
        cy.clearSession();
        // Cách 1: Thiết lập giá trị cookie trực tiếp
        // Cách 2: Với các hệ thống có chức năng login cơ bản, nên sử dụng hàm LoginbyApi từ command.
        cy.visit("https://qalogin-gqt-spa.vacv-nonprod.click/qa-hxjhdknbdklnbklnbkjkld.html#/pages/empty");
        cy.get('.ml-2').should('be.visible').click();
        cy.get("#username").type(Cypress.env('username'));
        cy.get("#password").type(Cypress.env('password'));
        cy.get("#submit-user").click();
        cy.get('.p-select-label').click();
        cy.get('.p-select-list-container').should('be.visible').within(() => {
            cy.get('#pv_id_11_53 > .role-options').contains('Lorelei Reid').click();
        });
        cy.get('#submit-user').click();
        cy.visit('https://qalogin-gqt-spa.vacv-nonprod.click/qa-hxjhdknbdklnbklnbkjkld.html#/internal/packages'); // Cập nhật đường dẫn nếu cần
    
        cy.wait(30000);
    
        cy.log('success');
    });
    
    describe('Kiểm tra data Gateways có tồn tại và trạng thái checkbox hiển thị chính xác.', () => {
        GATEWAYS.forEach(($gateway:any) => {
            it(`Kiểm tra data Gateways ${$gateway.code}.`, () => {
                checkIntegrationPackageData('Gateways',$gateway.code, $gateway.status)
            });
        })
    })

    describe('Kiểm tra data Destinations có tồn tại và trạng thái checkbox hiển thị chính xác.', () => {
        DESTINATIONS.forEach(($destination:any) => {
            it(`Kiểm tra data Gateways ${$destination.code}.`, () => {
                checkIntegrationPackageData('Destinations',$destination.code,$destination.status,$destination.airportCode)
            });
        })
    })

    // it(`Kiểm tra data Gateways có tồn tại và trạng thái checkbox hiển thị chính xác.`, () => {

    //     //Lấy dữ liệu từ JSON
    //     cy.get('[pc53=""]').should('be.visible').then(() => {
    //         GATEWAYS.forEach(($gateway:any) => {
    //             cy.get('[pc53=""] > .p-datatable-column-header-content > .p-datatable-filter > .p-button').click({ force: true });
    //             cy.get('input[placeholder="Airport Code"]').type($gateway.code);
    //             cy.get('button[aria-label="Apply"]').click({ force: true });
    //             cy.wait(2000); // Chờ dữ liệu load xong
                
    //             //Kiểm tra dữ liệu Gateway tồn tại trên GUI
    //             //Kiểm tra trạng thái check-box Package
    //             cy.get('div[class="city-table"]').should('be.visible').within(() => {
    //                 cy.get('tr').eq(1).then(($row) => {
    //                     cy.wrap($row).find('td').eq(0).should('have.text', $gateway.code);
    //                     cy.wrap($row).find('div[id="Package"]').eq(0).then(($checkbox) => {
    //                         if ($gateway.status === 'OPEN') {
    //                             expect($checkbox.attr('data-p-checked')).to.equal('true');
    //                         }
    //                         else
    //                             expect($checkbox.attr('data-p-checked')).to.equal('false');
    //                     });
    //                 });
    //             });
    
    //             //Clear data
    //             cy.get('[pc53=""] > .p-datatable-column-header-content > .p-datatable-filter > .p-button').click({ force: true });
    //             cy.get('input[placeholder="Airport Code"]').clear();
    //             cy.get('button[aria-label="Apply"]').click({ force: true });
    //             cy.wait(2000); // Chờ dữ liệu load xong
    //         });
    //     });
    // })


    // it(`Kiểm tra data Destinations có tồn tại và trạng thái checkbox hiển thị chính xác.`, () => {
    //     //Lấy dữ liệu từ JSON
    //     cy.get('[pc89=""]').then(() => {
    //         DESTINATIONS.forEach(($data:any) => {
    //             cy.get('[pc89=""] > .p-datatable-column-header-content > .p-datatable-filter > .p-button').click({ force: true });
    //             cy.get('input[placeholder="SV Dest ID"]').type($data.code);
    //             cy.get('button[aria-label="Apply"]').click({ force: true });
    //             cy.wait(2000); // Chờ dữ liệu load xong
                
    //             //Kiểm tra dữ liệu data tồn tại trên GUI
    //             //Kiểm tra trạng thái check-box Package
    //             cy.get('div[class="city-table"]').should('be.visible').within(() => {
    //                 cy.contains('td', $data.airportCode).closest('tr').then(($row) => {
    //                     cy.wrap($row).find('td').eq(9).should('have.text', $data.code);
    //                     cy.wrap($row).find('div[id="Package"]').eq(1).then(($checkbox) => {
    //                         if ($data.status === 'OPEN') {
    //                             expect($checkbox.attr('data-p-checked')).to.equal('true');
    //                         }
    //                         else
    //                             expect($checkbox.attr('data-p-checked')).to.equal('false');
    //                     });
    //                     cy.wrap($row).find('div[id="Hotel"]').eq(1).then(($checkbox) => {
    //                         if ($data.status === 'OPEN') {
    //                             expect($checkbox.attr('data-p-checked')).to.equal('true');
    //                         }
    //                         else
    //                             expect($checkbox.attr('data-p-checked')).to.equal('false');
    //                     });
    //                 });
    //             });

    //             // //Clear data
    //             cy.get('[pc89=""] > .p-datatable-column-header-content > .p-datatable-filter > .p-button').click({ force: true });
    //             cy.get('input[placeholder="SV Dest ID"]').clear();
    //             cy.get('button[aria-label="Apply"]').click({ force: true });
    //             cy.wait(2000); // Chờ dữ liệu load xong
    //         });
    //     });
    // })
})