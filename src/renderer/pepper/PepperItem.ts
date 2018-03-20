import { Model, Ref } from "@/pepper/db";
import PepperCreator from "@/pepper/PepperCreator";
import debug from "debug";
import dedent from "dedent";
import * as fs from "fs-extra";
import { join } from "path";
import shortid from "shortid";
import PepperAttachment from "./PepperAttachment";
import PepperFolder from "./PepperFolder";

const log = debug("pepper:item");

export default class PepperItem {
    public itemType: string;
    public title: string;
    public creators: Array<Ref<PepperCreator>>;
    public date: string;
    public abstractNote: string;
    public notes: any[];
    public tags: string[];
    public DOI: string;
    public url: string;
    public publicationTitle: string;
    public extra: string;
    public attachments: Array<Ref<PepperAttachment>>;
    public volume: string;
    public issue: string;
    public pages: string;
    public ISSN: string;
    public done: boolean;
    public citeKey: string;
    public _id: string;
    public $ref: Ref<PepperItem>;
    public parent: Ref<PepperFolder>;

    constructor(itemType: string) {
        this.itemType = itemType;
        this.creators = [];
        this.notes = [];
        this.tags = [];
        this.attachments = [];
        this.done = true;
    }

    get $formattedCreators(): string {
        if (this.creators.length > 2) {
            return `${this.creators[0].$.lastName} et al.`;
        } else if (this.creators.length === 2) {
            return `${this.creators[0].$.lastName} and ${this.creators[1].$.lastName}`;
        } else if (this.creators.length === 1) {
            return this.creators[0].$.lastName;
        }
        return "";
    }

    public async saveAttachments(path: string) {
        await Promise.all(this.attachments.map((x) => x.$.save(path, this)));
    }

    public async writeDisk(path: string) {
        this.saveAttachments(path);
    }

    get $mainFile(): string {
        // TODO: possibly use priority for each type
        for (const attachment of this.attachments) {
            if (attachment.$.mimeType === "application/pdf") {
                return join(attachment._id, attachment.$.entry);
            }
        }
        return undefined;
    }

    get bibTeX(): string {
        const authors = this.creators.map((x) => x.$._()).join(" and ");
        // log(authors);
        return dedent`
            @article{${this.citeKey},
                abstract = {${this.abstractNote}},
                date = {${this.date}},
                author = {${authors}},
                title = {${this.title}},
                url = {${this.url}},
            }
        `;
    }

    public remote(): void {
        //
    }
}

export const modelItem = new Model<PepperItem>("item", PepperItem);
