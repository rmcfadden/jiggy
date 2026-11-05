// schema-version: 1.0
import type { ContactGroupBase } from "../datasource/contactGroupBase";
import type { Contact } from "./contact";
/** View ContactGroup. */
export const contactGroup = (init: Partial<ContactGroup>): ContactGroup => ({ ...init } as ContactGroup);
export interface ContactGroup extends ContactGroupBase {
  members: Contact[];
}
