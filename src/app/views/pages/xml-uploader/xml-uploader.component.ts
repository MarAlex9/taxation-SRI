import { Component  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { parseString } from 'xml2js';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';

interface Factura{
  infoTributaria: InfoTributaria[];
  detalles: Detalles[];
}
interface  InfoTributaria{
  claveAcceso: string;
  razonSocial: string;
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

interface DetalleMostrar {
  codigoPrincipal: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  precioTotalSinImpuesto: number;
  tarifa: number;
  valor: number;
  creditoTributario: boolean;
  razonSocial: string;

}

interface FacturaMostrar{
  claveAcceso: string;
  razonSocial: string;
  detalles: DetalleMostrar;
}

interface Impuestos {
  impuesto: Impuesto[];
}
interface Impuesto {
  tarifa: number;
  baseImponible: number;
  valor: number;
}



@Component({
  selector: 'app-xml-uploader',
  standalone: true,
  imports: [MatTableModule, MatCheckboxModule, CommonModule],
  templateUrl: './xml-uploader.component.html',
  styleUrl: './xml-uploader.component.scss'
})
export class XmlUploaderComponent {
  displayedColumns: string[] = ['razonSocial', 'cantidad', 'descripcion', 'precioUnitario', 'precioTotalSinImpuesto', 'IVA', 'creditoTributario'];

  dataSource = new MatTableDataSource<DetalleMostrar>();

  listDetalles: DetalleMostrar[] = [];

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
        this.dataSource.data = this.listDetalles;
      });

    });
  }

  extractDetalles(obj: Factura): void{
    const detallesArray = obj.detalles[0].detalle;
    // if(!this.listDetalles.find(l => l.claveAcceso === obj.infoTributaria[0].claveAcceso[0])){
    //   const factura: FacturaMostrar = {
    //     razonSocial: obj.infoTributaria[0].razonSocial[0],
    //     claveAcceso: obj.infoTributaria[0].claveAcceso[0],
    //     detalles = []
    //   }
      detallesArray.forEach((detalle: any) => {
        const detalleObj: DetalleMostrar = {
          codigoPrincipal: detalle.codigoPrincipal[0],
          descripcion: detalle.descripcion[0],
          cantidad: parseFloat(detalle.cantidad[0]),
          precioUnitario: parseFloat(detalle.precioUnitario[0]),
          precioTotalSinImpuesto: parseFloat(detalle.precioTotalSinImpuesto[0]),
          tarifa: detalle.impuestos[0].impuesto[0].tarifa[0],
          valor: detalle.impuestos[0].impuesto[0].valor[0],
          razonSocial: obj.infoTributaria[0].razonSocial[0],
          creditoTributario: false
        };
        this.groupAdd(detalleObj);
      });
    //}
  }

  groupAdd(detalleM: DetalleMostrar): void {
  //  if(!this.listDetalles.find(l => l.claveAcceso === detalleM.claveAcceso))
        this.listDetalles.push(detalleM);
  }
    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: DetalleMostrar): void {
      console.error(row);
      //return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row}`;
    }
}
