
import * as vscode from 'vscode';
import { Lense, ok, hexToColor, Color, Palette } from './fenlense';


export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "fen-lense" is now active!');

    let def_light: Color = [240, 217, 181];
    let def_dark: Color = [181, 136, 99];
    let def_castle: Color = [255, 127, 39];
    let def_enpassant: Color = [153, 217, 234];
    let color_light = vscode.workspace.getConfiguration("fenlense").get<string>("lightSquareColor", "");
    let color_dark = vscode.workspace.getConfiguration("fenlense").get<string>("darkSquareColor", "");
    let color_castle = vscode.workspace.getConfiguration("fenlense").get<string>("castlingRightsColor", "");
    let color_enpassant = vscode.workspace.getConfiguration("fenlense").get<string>("enPassantSquareColor", "");
    let show_castling = vscode.workspace.getConfiguration("fenlense").get<boolean>("showCastlingRights", true);
    let show_enpassant = vscode.workspace.getConfiguration("fenlense").get<boolean>("showEnpassantSquare", true);

    let palette: Palette = {
        dark: hexToColor(color_dark, def_dark),
        light: hexToColor(color_light, def_light),
        castle: hexToColor(color_castle, def_castle),
        enpassant: hexToColor(color_enpassant, def_enpassant),
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
                console.log("failed to parse FEN String!")
                return null;
            }
        }
    });

    context.subscriptions.push(chess_hover);
}

export function deactivate() {}
