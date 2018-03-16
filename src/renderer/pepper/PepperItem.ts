import * as fs from "fs-extra";
import { join } from "path";
import PepperAttachment from "./PepperAttachment";

export class Creator {
    firstName: string;
    lastName: string;
    creatorType: string;

    constructor(firstName: string, lastName: string, creatorType?: string) {
        this.firstName = firstName
        this.lastName = lastName
        this.creatorType = creatorType
    }
}

export default class PepperItem {
    public itemType: string;
    public title: string;
    public creators: Creator[];
    public date: string;
    public abstractNote: string;
    public notes: any[];
    public tags: string[];
    public DOI: string;
    public url: string;
    public publicationTitle: string;
    public extra: string;
    public attachments: PepperAttachment[];
    public volume: string;
    public issue: string;
    public pages: string;
    public ISSN: string;
    public done: boolean;
    public citeKey: string;

    constructor(itemType: string) {
        this.itemType = itemType;
        this.creators = [];
        this.notes = [];
        this.tags = [];
        this.attachments = [];
        this.done = true;
    }

    public getCreators(): string {
        if (this.creators.length > 2) {
            return `${this.creators[0].lastName} et al.`;
        } else if (this.creators.length === 2) {
            return `${this.creators[0].lastName} and ${this.creators[1].lastName}`;
        } else if (this.creators.length === 1) {
            return this.creators[0].lastName;
        }
        return "";
    }

    public async saveAttachments(path: string) {
        await Promise.all(this.attachments.map((x) => x.save(path, this)));
    }

    public async writeDisk(path: string) {
        this.saveAttachments(path);
    }

    public getMainFile(): string | undefined {
        // TODO: possibly use priority for each type
        for (const attachment of this.attachments) {
            if (attachment.mimeType === "application/pdf") {
                return join(attachment.id, attachment.entry);
            }
        }
        return undefined;
    }
}
