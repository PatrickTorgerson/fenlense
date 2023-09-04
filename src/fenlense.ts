import { Position, TextDocument } from "vscode";
import { Images } from './images';
import { encode } from 'typescript-base64-arraybuffer';
import Jimp from "jimp";
import { truncate } from "fs/promises";

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

type Pieces = [Option<Piece>, ...Option<Piece>[]] & { length: 64 };
const empty_piece_buffer: Pieces = [null,null,null,null,null,null,null,null,
                                    null,null,null,null,null,null,null,null,
                                    null,null,null,null,null,null,null,null,
                                    null,null,null,null,null,null,null,null,
                                    null,null,null,null,null,null,null,null,
                                    null,null,null,null,null,null,null,null,
                                    null,null,null,null,null,null,null,null,
                                    null,null,null,null,null,null,null,null]

class Board {
    public pieces: Pieces;
    public castling: string;
    public enpassant: Option<[number, number]>;
    constructor(pieces: Pieces, castling: string, enpassant: Option<[number, number]>) {
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
        let checkerboard = new Jimp(this.tileSize * 8, this.tileSize * 8, this.palette.dark);
        checkerboard.composite(
            await this.getCheckerboardBackground(),
            0,0
        )

        // en passant
        if(issome(enpassant) && this.showEnpassant) {
            checkerboard.composite(
                await this.getBoardEnPassant(),
                enpassant[0] * this.tileSize,
                (7 - enpassant[1]) * this.tileSize,
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
        for(let i = 0; i < 64; i++) {
                if(issome(board.pieces[i])) {
                    const piece = board.pieces[i];
                    background.composite(
                        await piece?.getJimp()!,
                        (i % 8) * this.tileSize,
                        Math.trunc(i / 8) * this.tileSize,
                    );
                }
        }
        return encode(await background.getBufferAsync(Jimp.MIME_PNG));
    }

    private isUpper(str: String) {
        return str.toUpperCase() == str;
    }

    /// parse fen into Position
    /// lieniant parsing:
    ///  - arbitrary number of delimiting spaces
    ///  - duplicate castling rights ignored
    ///  - leading single quotes and double quotes ignored
    ///  - trailing single quotes and double quotes ignored
    private parseFen(fen: String) : Result<Board> {


        let board = new Board(empty_piece_buffer, "", null);

        let fen_index: number = 0;
        while (fen_index < fen.length && fen[fen_index] == ' ')
            fen_index += 1;
        if (fen_index >= fen.length)
            return new Error("! missing fields");

        if (fen.length - fen_index < 25)
            return new Error("! fen too short");
        for (let i = 0; i < 10; ++i) {
            if (!"12345678PNBRQKpnbrqk/".includes(fen[fen_index + i]))
                return new Error("! invalid char");
        }

        // field 1 : piece placement
        let pieces_per_rank = 0;
        let rank = 1;
        let square_index: number = 0;
        while (true) {
            if (fen_index >= fen.length)
                return new Error("! missing fields");
            if (square_index >= 64) {
                if (fen[fen_index] == ' ') {
                    break;
                } else if (fen[fen_index] == '/')
                    return new Error("too many ranks");
                else return new Error("too many pieces on rank 8");
            }
            const piece = fen[fen_index];
            if ("12345678".includes(piece)) {
                fen_index += 1;
                square_index += Number(piece);
                pieces_per_rank += Number(piece);
            } else if ("PNBRQKpnbrqk".includes(piece)) {
                const color: PieceColor = this.isUpper(piece) ?
                    PieceColor.WHITE : PieceColor.BLACK;
                board.pieces[square_index] = Lense.charToPiece(piece.toUpperCase(), color);
                fen_index += 1;
                square_index += 1;
                pieces_per_rank += 1;
            } else if (piece == '/') {
                // assert square_index on file a
                if (pieces_per_rank < 8)
                    return new Error(`missing ${8 - pieces_per_rank} piece(s) on rank ${rank}`);
                else if (pieces_per_rank > 8)
                    return new Error(`${pieces_per_rank - 8} extra piece(s) on rank ${rank}`);
                fen_index += 1;
                pieces_per_rank = 0;
                rank += 1;
            } else if (piece == ' ') {
                if (pieces_per_rank < 8)
                    return new Error(`missing ${8 - pieces_per_rank} piece(s) on rank ${rank}`);
                else if (pieces_per_rank > 8)
                    return new Error(`${pieces_per_rank - 8} extra piece(s) on rank ${rank}`);
                return new Error(`missing ${8 - rank} rank(s)`);
            }
            else return new Error("invalid piece: " + piece);
        }
        while (fen_index < fen.length && fen[fen_index] == ' ')
            fen_index += 1;
        if (fen_index >= fen.length)
            return new Error("missing fields: side to move, castling rights, enpassant, fifty move counter, full move counter");

        // -- field 2 : side to move
        if (fen[fen_index] != 'w' && fen[fen_index] != 'b')
            return new Error("unrecognized side to move: " + fen[fen_index]);
        fen_index += 1;

        while (fen_index < fen.length && fen[fen_index] == ' ')
            fen_index += 1;
        if (fen_index >= fen.length)
            return new Error("missing fields: castling rights, enpassant, fifty move counter, full move counter");

        // -- field 3 : castling rights
        if (fen[fen_index] == '-')
            fen_index += 1;
        else {
            let end = fen_index;
            while (end < fen.length && fen[end] != ' ') {
                if ("kqKQ".includes(fen[end]))
                    end += 1;
                else return new Error("unrecognized castling right: " + fen[end]);
            }
            board.castling = fen.substring(fen_index, end);
            fen_index = end;
        }

        while (fen_index < fen.length && fen[fen_index] == ' ')
            fen_index += 1;
        if (fen_index >= fen.length)
            return new Error("missing fields: enpassant, fifty move counter, full move counter");

        // -- field 4 : En Passant target
        if (fen[fen_index] == '-')
            fen_index += 1;
        else {
            if (fen_index >= fen.length - 1)
                return new Error("missing enpassant rank");
            if (!"abcdefgh".includes(fen[fen_index]))
                return new Error("invalid enpassant file: " + fen[fen_index]);
            if (!"12345678".includes(fen[fen_index + 1]))
                return new Error("invalid enpassant rank: " + fen[fen_index + 1]);
            board.enpassant = [0,0];
            board.enpassant[0] = parseInt(fen[fen_index], 36) - 10;
            board.enpassant[1] = parseInt(fen[fen_index + 1]) - 1;
            fen_index += 2;
        }

        while (fen_index < fen.length && fen[fen_index] == ' ')
            fen_index += 1;
        if (fen_index >= fen.length)
            return new Error("missing fields: fifty move counter, full move counter");

        // -- field 5 : fifty move counter
        let end = fen_index;
        while (end < fen.length && fen[end] != ' ')
            end += 1;
        const fifty_count = parseInt(fen.substring(fen_index, end), 10);
        if (fifty_count != 0 && !fifty_count)
            return new Error("invalid fifty move counter: " + fen.substring(fen_index, end));
        fen_index = end;

        while (fen_index < fen.length && fen[fen_index] == ' ')
            fen_index += 1;
        if (fen_index >= fen.length)
            return new Error("missing field: full move counter");

        // -- field 5 : full move counter
        end = fen_index;
        while (end < fen.length && fen[end] != ' ')
            end += 1;
        const full_count = parseInt(fen.substring(fen_index, end), 10);
        if (full_count != 0 && !full_count)
            return new Error("invalid full move counter: " + fen.substring(fen_index, end));

        return board;
    }

    private getHoveredString(line: string, first: number, position: number): Result<string> {
        let char = '\0';
        let begin = -1;
        for (let i = position; i > first; --i) {
            if (line[i] == '\'' || line[i] == '"') {
                char = line[i];
                begin = i;
                break;
            }
        }
        if (begin == -1)
            return new Error("! not inside string");

        let end = -1;
        for (let i = position; i < line.length; ++i) {
            if (line[i] == char) {
                end = i;
                break;
            }
        }
        if (end == -1)
            return new Error("! not inside string");

        return line.substring(begin + 1, end);
    }

    public strToBoard(document: TextDocument, position: Position): Result<Board> {
        const _line = document.lineAt(position);
        const first = _line.firstNonWhitespaceCharacterIndex;
        const line = _line.text;
        let str = this.getHoveredString(line, first, position.character);
        if(ok(str)) {
            return this.parseFen(str);
        }
        return new Error("! couldn't get board");
    }
}
