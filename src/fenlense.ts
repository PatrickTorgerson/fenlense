import { Position, TextDocument } from "vscode";
import { Images } from './images';
import { encode } from 'typescript-base64-arraybuffer';
import Jimp from "jimp";

// a pop should appear for a string like this: "8/5k2/3p4/1p1Pp2p/pP2Pp1P/P4P1K/8/8 b - - 99 50"

type Result<T> = T | Error;

export const ok = <T>(r: Result<T>): r is T => !(r instanceof Error);

type Option<T> = T | null;

export const issome = <T>(r: Option<T>): r is T => !(r == null);

export const enum PieceColor {
    WHITE = 'w',
    BLACK = 'b'
}

export const enum PieceType {
    KING = 'K',
    QUEEN = 'Q',
    KNIGHT = 'N',
    BISHOP = 'B',
    PAWN = 'P',
    ROOK = 'R'
}

class Piece {
    private static images: Images = new Images();
    public type: PieceType;
    public color: PieceColor;

    constructor(type: PieceType, color: PieceColor) {
        this.type = type;
        this.color = color;
    }

    public async getJimp() {
        switch(this.type) {
            case PieceType.BISHOP:
                return this.color == PieceColor.WHITE ?
                    await Piece.images.whiteBishop() :
                    await Piece.images.blackBishop();
            case PieceType.KING:
                return this.color == PieceColor.WHITE ?
                    await Piece.images.whiteKing() :
                    await Piece.images.blackKing();
            case PieceType.PAWN:
                return this.color == PieceColor.WHITE ?
                    await Piece.images.whitePawn() :
                    await Piece.images.blackPawn();
            case PieceType.KNIGHT:
                return this.color == PieceColor.WHITE ?
                    await Piece.images.whiteKnight() :
                    await Piece.images.blackKnight();
            case PieceType.QUEEN:
                return this.color == PieceColor.WHITE ?
                    await Piece.images.whiteQueen() :
                    await Piece.images.blackQueen();
            case PieceType.ROOK:
                return this.color == PieceColor.WHITE ?
                    await Piece.images.whiteRook() :
                    await Piece.images.blackRook();
        }
    }
}

class Board {
    public pieces: Array<Array<Option<Piece>>>;
    public castling: string;
    public enpassant: Option<[number, number]>;
    constructor(pieces: Array<Array<Option<Piece>>>, castling: string, enpassant: Option<[number, number]>) {
        this.pieces = pieces;
        this.castling = castling;
        this.enpassant = enpassant;
    }
}


export function isValidHex(hex: string): boolean {
    hex.toLowerCase();
    var result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return !(result === null);
}

export class Palette {
    public dark: string = "";
    public light: string = "";
    public castle: string = "";
    public enpassant: string = "";
}

export class Lense {
    private tileSize: number;
    private palette: Palette;
    private background: Option<Jimp>;
    private castlingMarker: Option<Jimp>;
    private enpassantTile: Option<Jimp>;
    private lightTile: Option<Jimp>;
    private showCastling: boolean;
    private showEnpassant: boolean;

    constructor(tileSize: number, palette: Palette, showCastling: boolean, showEnpassant: boolean) {
        this.showCastling = showCastling;
        this.showEnpassant = showEnpassant;
        this.palette = palette;
        this.tileSize = tileSize;
        this.background = null;
        this.castlingMarker = null;
        this.enpassantTile = null;
        this.lightTile = null;
    }

    public static charToPiece(c: string, color: PieceColor) {
        let type : PieceType = PieceType.BISHOP;
        switch(c) {
            case 'K':
                type = PieceType.KING;
                break;
            case 'Q':
                type = PieceType.QUEEN;
                break;
            case 'N':
                type = PieceType.KNIGHT;
                break;
            case 'B':
                type = PieceType.BISHOP;
                break;
            case 'P':
                type = PieceType.PAWN;
                break;
            case 'R':
                type = PieceType.ROOK;
                break;
            default:
                return null;
        }
        return new Piece(type, color);
    }

    private async getBoardEnPassant() {
        if(issome(this.enpassantTile)) {
            return this.enpassantTile;
        }
        let enpassantTile = new Jimp(this.tileSize, this.tileSize, this.palette.enpassant);
        this.enpassantTile = enpassantTile;
        return enpassantTile;
    }

    private async getBoardCastlingMarker() {
        if(issome(this.castlingMarker)) {
            return this.castlingMarker;
        }
        const size = Math.round(this.tileSize/4);
        let castlingMarker = new Jimp(size, size, this.palette.castle);
        this.castlingMarker = castlingMarker;
        return castlingMarker;
    }

    private async getBoardLightTile() {
        if(issome(this.lightTile)) {
            return this.lightTile;
        }
        let lightTile = new Jimp(this.tileSize, this.tileSize, this.palette.light);
        this.lightTile = lightTile
        return lightTile;
    }

    private async getCheckerboardBackground() {
        if(issome(this.background)) {
            return this.background;
        }

        let background = new Jimp(this.tileSize * 8, this.tileSize * 8, this.palette.dark);

        for(let i = 0; i < 8; i++) {
            for(let j = (i & 1); j < 8; j+=2) {
                background.composite(
                    await this.getBoardLightTile(),
                    i * this.tileSize,
                    j * this.tileSize);
            }
        }

        this.background = background;
        return this.background;
    }

    private async boardBackground(enpassant: Option<[number, number]>, castling: string) {
        let checkerboard = await this.getCheckerboardBackground();

        // en passant
        if(issome(enpassant) && this.showEnpassant) {
            checkerboard.composite(
                await this.getBoardEnPassant(),
                enpassant[1] * this.tileSize,
                (7 - enpassant[0]) * this.tileSize,
            );
        }

        // castling
        if(castling.includes("q") && this.showCastling) {
            checkerboard.composite(
                await this.getBoardCastlingMarker(),
                0,0
            );
        }
        if(castling.includes("k") && this.showCastling) {
            checkerboard.composite(
                await this.getBoardCastlingMarker(),
                7 * this.tileSize, 0
            );
        }
        if(castling.includes("Q") && this.showCastling) {
            checkerboard.composite(
                await this.getBoardCastlingMarker(),
                0, 7 * this.tileSize
            );
        }
        if(castling.includes("K") && this.showCastling) {
            checkerboard.composite(
                await this.getBoardCastlingMarker(),
                7 * this.tileSize, 7 * this.tileSize
            );
        }
        return await checkerboard;
    }

    public async populateBoard(board: Board) {
        let background = await this.boardBackground(board.enpassant, board.castling);
        for(let i = 0; i < 8; i++) {
            for(let j = 0; j < 8; j++) {
                if(issome(board.pieces[i][j])) {
                    const piece = board.pieces[i][j];
                    background.composite(
                        await await piece?.getJimp()!,
                        j * this.tileSize,
                        i * this.tileSize,
                    );
                }
            }
        }
        return encode(await background.getBufferAsync(Jimp.MIME_PNG));
    }

    private isUpper(str: String) {
        return str.toUpperCase() == str;
    }

    private parseFen(str: String) : Result<Board> {
        let rows = str.split(/ (.*)/s);
        if (rows.length != 3) return new Error("invalid fen string");
        rows = [rows[0], rows[1]];
        let attrs = rows[1].split(' ');
        rows = rows[0].split('/');
        if (rows.length != 8 || attrs.length != 5) new Error("invalid fen string");
        if(!(attrs[2] == "-" || attrs[2].length == 2)) {
            return new Error("invalid enpassant");
        }
        // create empty matrix
        let board : any = []
        for(let i = 0; i < 8; i++) {
            board.push([])
            for(let j = 0; j < 8; j++) {
                board[i].push( null );
            }
        }
        for(let i = 0; i < rows.length; i++) {
            let j = 0;
            for(let ci = 0; ci < rows[i].length; ci++) {
                let c = rows[i][ci];
                if("PNBRQK".includes(c.toUpperCase())) {
                    let color = PieceColor.BLACK;
                    if( this.isUpper(c) ) {
                        color = PieceColor.WHITE;
                    }
                    let piece = Lense.charToPiece(c.toUpperCase(), color);
                    board[i][j] = piece;
                    j++;
                } else if("12345678".includes(c)) {
                    j += Number(c);
                    if(j > 8) return new Error("Invalid row sum");
                } else {
                    return new Error("Invalid FEN string character");
                }
            }
            if(j!=8) return new Error("invalid fen string");
        }

        let enpassant : Option<[number, number]> = null;
        if(attrs[2] != "-") {
            enpassant = [0, 0];
            enpassant[1] = parseInt(attrs[2][0], 36) - 10;
            enpassant[0] = parseInt(attrs[2][1])-1;
        }
        return new Board(board, attrs[1], enpassant);
    }

    private stringCheck(text: string, begin: number, end: number) {

        let escape = false;
        let res = {
            numberQuotes: 0,
            lastQuoteIdx: 0,
            firstQuoteIdx: 0,
        }
        for(let i : number = begin; i < end; i++) {
            if(escape) {
                escape = false;
                continue;
            }
            if(text[i] == '\\') {
                escape = true
            } else if(text[i] == '"') {
                res.lastQuoteIdx = i;
                if(res.numberQuotes == 0) res.firstQuoteIdx = i;
                res.numberQuotes++;
            }
        }
        return res;
    }

    private getHoveredString(line: string, first: number, position: number): Result<string> {
        // check if we are inside string (must have an odd number of valid " before position)
        let res = this.stringCheck(line, first, position);
        // if it is even, nothing happens (we are not inside a string)
        if(!(res.numberQuotes & 1)) {
            return new Error("not inside string");
        }
        // if we reach here, it is odd, and we are inside a string
        // check where the string ends
        let beginStr = res.lastQuoteIdx+1;
        res = this.stringCheck(line, position, line.length);
        // we won't accept multine strings here!
        if(!res.firstQuoteIdx) {
            return new Error("not inside string");
        }
        let endStr = res.firstQuoteIdx;
        return line.substring(beginStr, endStr);
    }

    public strToBoard(document: TextDocument, position: Position): Result<Board> {
        const _line = document.lineAt(position);
        const first = _line.firstNonWhitespaceCharacterIndex;
        const line = _line.text;
        let str = this.getHoveredString(line, first, position.character);
        if(ok(str)) {
            return this.parseFen(str);
        }
        return new Error("couldn't get board");
    }
}
