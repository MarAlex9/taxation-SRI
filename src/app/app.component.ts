import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { XmlUploaderComponent } from "./views/pages/xml-uploader/xml-uploader.component";

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [RouterOutlet, XmlUploaderComponent]
})
export class AppComponent {
  title = 'taxation-SRI';
}
