export function getDisplayNameFromRiotId(name: string): string {
    if (!name) return "";
    if (name.includes("#")) {
        return name.split("#")[0];
    }
    return name;
}
