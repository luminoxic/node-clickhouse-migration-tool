export class SqlUtils {
    public static getSqlQueriesFromString(content: string): string[] {
        const queries = content
            .replace(/(--|#!|#\s).*(\n|\r\n|\r|$)/gm, '\n')
            .replace(/^\s*(SET\s).*(\n|\r\n|\r|$)/gm, '')
            .replace(/(\n|\r\n|\r)/gm, ' ')
            .replace(/\s+/g, ' ')
            .split(';')
            .map((el: string) => el.trim())
            .filter((el: string) => el.length != 0);
    
        return queries;
    };

    public static getSqlSetsFromString(content: string): { [key: string]: string } {
        const parsedSets = content
            .replace(/(--|#!|#\s).*(\n|\r\n|\r|$)/gm, '\n')
            .replace(/^\s*(?!SET\s).*(\n|\r\n|\r|$)/gm, '')
            .replace(/^\s*(SET\s)/gm, '')
            .replace(/(\n|\r\n|\r)/gm, ' ')
            .replace(/\s+/g, '')
            .split(';')
            .reduce((result, value) => {
                const [setKey, setValue] = value.split('=');
                if (setKey && setValue) {
                    result[setKey] = setValue;
                }

                return result;
            }, {});

        return parsedSets;
    };
}
