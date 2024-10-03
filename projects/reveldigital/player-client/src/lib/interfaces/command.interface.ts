export interface ICommand {
    /**
     * Command name
     * 
     * @type {string}
     * 
     * @memberof Command
     */
    name: string;

    /**
     * Command arguments
     * 
     * @type {Array<string>}
     * 
     * @memberof ICommand
     */
    arg: string;
}
