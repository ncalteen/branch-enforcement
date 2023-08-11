export interface PolicyEntry {
  head: RegExp
  base: RegExp
}

export interface Policy extends Array<PolicyEntry> {}
