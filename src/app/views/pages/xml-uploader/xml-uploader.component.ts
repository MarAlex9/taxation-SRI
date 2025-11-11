import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { parseString } from 'xml2js';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatCardModule} from '@angular/material/card';

interface Totales {
  iva0: number;
  creditoTributario: number;
  sinCreditoTributario: number;
  totalFacturas: number;
}

interface Factura {
  infoTributaria: InfoTributaria[];
  detalles: Detalles[];
}
interface InfoTributaria {
  claveAcceso: string;
  razonSocial: string;
  ruc: string;
}
interface Detalles {
  detalle: Detalle[];
}
interface Detalle {
  codigoPrincipal: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  precioTotalSinImpuesto: number;
  impuestos: Impuestos[];
}
interface Impuestos {
  impuesto: Impuesto[];
}
interface Impuesto {
  tarifa: number;
  baseImponible: number;
  valor: number;
}


interface DetalleMostrar {
  codigoPrincipal: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  precioTotalSinImpuesto: number;
  tarifa: number;
  valor: number;
  creditoTributario: boolean;

}

interface FacturaMostrar {
  ruc: string;
  razonSocial: string;
  detalles: DetalleMostrar[];
}




@Component({
  selector: 'app-xml-uploader',
  standalone: true,
  imports: [MatTableModule, MatCheckboxModule, CommonModule, MatCardModule],
  templateUrl: './xml-uploader.component.html',
  styleUrl: './xml-uploader.component.scss'
})
export class XmlUploaderComponent {
  displayedColumns: string[] = ['razonSocial', 'cantidad', 'descripcion', 'precioUnitario', 'precioTotalSinImpuesto', 'IVA', 'creditoTributario'];

  dataSource = new MatTableDataSource<FacturaMostrar>();

  listFacturas: Factura[] = [];
  listFacturasMostrar: FacturaMostrar[] = [];

  onFilesSelected(event: any) {
    const files: FileList = event.target.files;
    const fileArray = Array.from(files);

    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const xmlContent = e.target.result;
        this.parseXML(xmlContent);
      };
      reader.readAsText(file);
    });
  }

  parseXML(xml: string) {
    parseString(xml, (err: any, result: any) => {
      if (err) {
        console.error('Error parsing XML:', err);
        return;
      }
      parseString(result.autorizacion.comprobante[0], (errDetalles: any, resultDetalles: any) => {
        if (errDetalles) {
          console.error('Error parsing XML:', errDetalles);
          return;
        }
        this.extractDetalles(resultDetalles.factura);
        this.dataSource.data = this.listFacturasMostrar;
      });

    });
  }

  extractDetalles(obj: Factura): void {
    const detallesArray = obj.detalles[0].detalle;
    const existe = this.listFacturas.find(l => l.infoTributaria[0].claveAcceso[0] === obj.infoTributaria[0].claveAcceso[0]);
    if (!existe) {
      this.listFacturas.push(obj);
      this.groupAdd(obj);
    }
  }

  convertFacturaMostrar(factura: Factura): FacturaMostrar {
    const facturaM: FacturaMostrar = {
      razonSocial: factura.infoTributaria[0].razonSocial[0],
      ruc: factura.infoTributaria[0].ruc[0],
      detalles: this.convertDetallesMostrar(factura.detalles)
    }
    return facturaM;
  }

  convertDetallesMostrar(detalles: Detalles[]): DetalleMostrar[] {
    const detalleM: DetalleMostrar[] = [];
    const detalle = detalles[0].detalle;
    detalle.forEach((data: any) => {
      const detalleObj: DetalleMostrar = {
        codigoPrincipal: data.codigoPrincipal[0],
        descripcion: data.descripcion[0],
        cantidad: parseFloat(data.cantidad[0]),
        precioUnitario: parseFloat(data.precioUnitario[0]),
        precioTotalSinImpuesto: parseFloat(data.precioTotalSinImpuesto[0]),
        tarifa: data.impuestos[0].impuesto[0].tarifa[0],
        valor: data.impuestos[0].impuesto[0].valor[0],
        creditoTributario: false
      };
      detalleM.push(detalleObj);
    });
    return detalleM;
  }

  groupAdd(factura: Factura): void {
    const facturaM = this.convertFacturaMostrar(factura);
    const indiceF = this.listFacturasMostrar.findIndex(f => f.ruc == facturaM.ruc);

    if (indiceF != -1) {
      facturaM.detalles.forEach(d => {
        const indiceD = this.listFacturasMostrar[indiceF].detalles.findIndex(di =>
          di.codigoPrincipal == d.codigoPrincipal
          && di.precioUnitario == d.precioUnitario);
        if (indiceD != -1) {
          this.listFacturasMostrar[indiceF].detalles[indiceD].cantidad += d.cantidad;
          this.listFacturasMostrar[indiceF].detalles[indiceD].precioTotalSinImpuesto += d.precioTotalSinImpuesto;
        } else {
          this.listFacturasMostrar[indiceF].detalles.push(d)
        }
      });
    } else {
      this.listFacturasMostrar.push(facturaM);
    }
  }
  /** The label for the checkbox on the passed row */
  checkboxLabel(facturaM: FacturaMostrar, detalleM: DetalleMostrar): void {
    const factura = this.listFacturasMostrar.find(f => f.ruc == facturaM.ruc);
    factura?.detalles.map(d => {
      if (d.codigoPrincipal == detalleM.codigoPrincipal && d.precioUnitario == detalleM.precioUnitario) {
        d.creditoTributario = !d.creditoTributario;
      }
    });
  }

  calculateTotals(): Totales {
    let iva0: number = 0;
    let creditoTributario: number = 0;
    let sinCreditoTributario: number = 0;
    this.listFacturasMostrar.forEach(f => {
      f.detalles.forEach(d => {
        if (d.creditoTributario && d.tarifa != 0) {
          creditoTributario += d.precioTotalSinImpuesto;
        } else if (d.tarifa != 0) {
          sinCreditoTributario += d.precioTotalSinImpuesto;
          //console.log(sinCreditoTributario);
          console.log(4.23 + 0.54);

        } else {
          iva0 += d.precioTotalSinImpuesto;
        }
      })
    });
    return {
      iva0: iva0,
      creditoTributario: creditoTributario,
      sinCreditoTributario: sinCreditoTributario,
      totalFacturas: this.listFacturas.length
    }
  }
}
