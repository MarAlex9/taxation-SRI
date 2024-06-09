import { Component } from '@angular/core';
import { parseString } from 'xml2js';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

interface Factura{
  infoTributaria: InfoTributaria[];
  detalles: Detalles[];
}
interface  InfoTributaria{
  claveAcceso: string;
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
}

@Component({
  selector: 'app-xml-uploader',
  standalone: true,
  imports: [MatTableModule],
  templateUrl: './xml-uploader.component.html',
  styleUrl: './xml-uploader.component.scss'
})
export class XmlUploaderComponent {
  displayedColumns: string[] = ['codigoPrincipal', 'descripcion', 'cantidad', 'precioUnitario', 'precioTotalSinImpuesto'];
  dataSource = new MatTableDataSource<Detalle>();

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
        const detalles = this.extractDetalles(resultDetalles.factura);
        this.dataSource.data = [...this.dataSource.data, ...detalles];
      });

    });
  }

  extractDetalles(obj: Factura): Detalle[] {
    const detalles: Detalle[] = [];
    const detallesArray = obj.detalles[0].detalle;

    detallesArray.forEach((detalle: any) => {
      const detalleObj: Detalle = {
        codigoPrincipal: detalle.codigoPrincipal[0],
        descripcion: detalle.descripcion[0],
        cantidad: parseFloat(detalle.cantidad[0]),
        precioUnitario: parseFloat(detalle.precioUnitario[0]),
        precioTotalSinImpuesto: parseFloat(detalle.precioTotalSinImpuesto[0])
      };
      detalles.push(detalleObj);
    });

    return detalles;
  }
}
