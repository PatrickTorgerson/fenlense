
import * as vscode from 'vscode';
import { Lense, ok, isValidHex, Palette } from './fenlense';


export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "fen-lense" is now active!');

    // "8/5k2/3p4/1p1Pp2p/pP2Pp1P/P4P1K/8/8 b kKqQ e3 99 50"

    let def_light: string = "#f0d9b5";
    let def_dark: string = "#b58863";
    let def_castle: string = "#ff7f27";
    let def_enpassant: string = "#99d9ea";
    let color_light = vscode.workspace.getConfiguration("fenlense").get<string>("lightSquareColor", "");
    let color_dark = vscode.workspace.getConfiguration("fenlense").get<string>("darkSquareColor", "");
    let color_castle = vscode.workspace.getConfiguration("fenlense").get<string>("castlingRightsColor", "");
    let color_enpassant = vscode.workspace.getConfiguration("fenlense").get<string>("enPassantSquareColor", "");
    let show_castling = vscode.workspace.getConfiguration("fenlense").get<boolean>("showCastlingRights", true);
    let show_enpassant = vscode.workspace.getConfiguration("fenlense").get<boolean>("showEnpassantSquare", true);

    let palette: Palette = {
        dark: isValidHex(color_dark) ? color_dark : def_dark,
        light: isValidHex(color_light) ? color_light : def_light,
        castle: isValidHex(color_castle) ? color_castle : def_castle,
        enpassant: isValidHex(color_enpassant) ? color_enpassant : def_enpassant,
    };

    // build game board tile
    let lense = new Lense(25, palette, show_castling, show_enpassant);

    let chess_hover = vscode.languages.registerHoverProvider('*', {
        async provideHover(document, position) {
            let boardPieces = lense.strToBoard(document, position);
            if(ok(boardPieces)) {
                let filledBoard = await lense.populateBoard(boardPieces);
                return new vscode.Hover(new vscode.MarkdownString(`![](data:image/png;base64,${filledBoard})`));
            } else {
                console.log("failed to parse fen: " + boardPieces.message)
                if (boardPieces.message[0] != '!') {
                    return new vscode.Hover(new vscode.MarkdownString(`${boardPieces.message}`));
                }
                return null;
            }
        }
    });

    context.subscriptions.push(chess_hover);
}

export function deactivate() {}
