import { App, Modal, Setting, TFile } from "obsidian";
import { FolderSuggest } from "../suggest/FolderSuggester";
import { createNoteFromEvent } from "../helper/AutoEventNoteCreator";
import type { GoogleCalendar, GoogleEvent } from "../helper/types";
import GoogleCalendarPlugin from './../GoogleCalendarPlugin';
import { FileSuggest } from "../suggest/FileSuggest";


/**
 * This class is used to diplay a select modal in which the user can select a calendar to see its events
 */
 export class CreateNotePromptModal extends Modal {
    event:GoogleEvent;
    template:string = null;
    folder:string = null;
    plugin = GoogleCalendarPlugin.getInstance();
    onSumbit: (newFile: TFile) => void;
    constructor(event: GoogleEvent, onSubmit:(newFile: TFile) => void) {
      super(window.app);
      this.event = event;
      this.onSumbit = onSubmit;
    }
  
    onOpen() {
      const { contentEl } = this;

      contentEl.createEl("h1", { text: "You can now select a template to use" });
  
      new Setting(contentEl)
        .setName("Template")
        .addSearch((cb) => {
          new FileSuggest(
              cb.inputEl,
              this.plugin
          );
          cb.setPlaceholder("Template")
              .setValue("")
              .onChange(new_template => this.template = new_template);
          // @ts-ignore
          cb.containerEl.addClass("templater_search");
      });
    
      
    
      new Setting(contentEl)
        .setName("Folder")
        .addSearch((cb) => {
            new FolderSuggest(cb.inputEl);
            cb.setPlaceholder("Example: folder1/folder2")
                .setValue((app.vault as any).config.newFileFolderPath)
                .onChange(new_folder => this.folder = new_folder);
            // @ts-ignore
            cb.containerEl.addClass("templater_search");
      });


      new Setting(contentEl)
        .setName("")
        .addButton(button => {
          button.setButtonText("Create Note")
          button.onClick(async (e)=> {
              const newNote = await createNoteFromEvent(this.event, this.folder, this.template)
              this.onSumbit(newNote);
              this.close();
          })
        })
    }
  
    onClose() {
      let { contentEl } = this;
      contentEl.empty();
    }
  }