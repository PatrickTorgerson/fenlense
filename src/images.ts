import Jimp from "jimp";
import { decode } from "typescript-base64-arraybuffer";

type Option<T> = T | null;
const issome = <T>(r: Option<T>): r is T => !(r == null);

const black_bishop = ("iVBORw0KGgoAAAANSUhEUgAAABkAAAAYCAQAAAClvJ5NAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAHdElNRQfmBQ8XFgXp0Tm0AAABnElEQVQ4y63SPWjTURQF8F8+mtg0OAixVhD8RLoJYkGc1FFdHJzUIjjp4uDi1Nm6B8GxdRdFBFfdRBQ/kBZBaKgKFgppq7VJ/tchCSYhqRk88JZ337nn3HMf/w0peen+pUzf2x1umnHAW7+H1TijKtRc7lfsL16QR1ZxeMqSClYsDmcq7YLXGkJiwbTcv5O6YkWI0UiFsO627PaUKRUhdsZs7A0hrDq/HSHjgRCHYiY+xWwca5KeKgwev+RU012mdcBx+werHLYsmsbutY2FNScHU3Z713rWHj+EZUcHG/vhMRk5OXUjcs2wnvvSHWo3Srn7ty5OabT6Lbr7ojrdTenNfLOWfeSlaPWr+pmz2bu6DtyQnPYkGYvO3JPU1dTD8iCVvG8HJ8fyXT3r6c9HziobjBM+arRTExJLzvXuu22waI8JDe9tGW99+1XPlC3YpSix1TnLmGsu2WdUBhlFI01XNtSQ2FQxZ95GW+u6rQ4zIfHLd+tdFkPdnb/jvzFnzQdVZKXVrPiqZFxeoo6CSRNedf+C3qX2ItV+8webspt0bupdjwAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMi0wNC0xMVQxMzo0MjoyOSswMDowMKE+lOsAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjItMDQtMTFUMTM6NDI6MjkrMDA6MDDQYyxXAAAAAElFTkSuQmCC");
const black_king = ("iVBORw0KGgoAAAANSUhEUgAAABkAAAAYCAQAAAClvJ5NAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAHdElNRQfmBQ8XFgXp0Tm0AAACY0lEQVQ4y62TXUjTYRSHn//+OlM3c+o2JEXNJPRCWwWZ1aUW4U0fmmQUMSioiPSqwBvrQoiCLiIoEPoQwcBM62KgXYgXSlqEwz4IFyrNbTW/pks3t9OFQ9xaYNC5eeGc93l/533P74X/FlpKSfoXwMBhejlKRryiGhexcBUL2XxlcvM6ubyiIH5JEzebTB27qSN18xoXWUEIcCVeMSGyKkqhoUKbueD0D+OhFi2QSA3P2a4r1af4HfODmh/hDYiy68SxluJCVVkMjU3aukazIwcVlT2tLi/ZuoVg0D7y8oatPxdQYC8LpU3d4fxnzJJHFfnySLo1YVTqOIudPjxs4wzLX27XZNgHAISGWz1iEgRBVKmUXrkgqlwWm1SIEsmbpVuut8haY0rC3eJxPJFeQvTi4g4FWGjk4/ql3Yxj3qGohDQgq7M/s6LcYech52ndAICeHFxTEgIN1DPQY/TVRj3kEB8YjhqflWRPX2fVmmE+45hIS6nfr9d8IokSDlJJJeWkkEc6QZbQc40j/vZmW+c3AQVAx2JqfYO1UTHMoeBkmjmC6DGSQzpOTIir/WZHa2IgSARZ025u0ja/YYFMTKSh4seLhwAWSic6zvUPEI6ePofCXZ59WNHhxc08IQyUYUbLGC+cg+/NYXeMYbiEVwnQhhsdWehRmWKIGVTKOcVOhAexyD187OEkJvx48REiGQMGVnnHE96S/octeYxv2jHTkTGCh5VITiWNIqrltsMb9HE61tJt2BONB7jPKHOsIghhfjHFa9V63AiyvlOJITVkkk8OBlSWcDHBd5Y3/9H+Er8BP/fZRoCTJSUAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjItMDQtMTFUMTM6NDI6MjkrMDA6MDChPpTrAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIyLTA0LTExVDEzOjQyOjI5KzAwOjAw0GMsVwAAAABJRU5ErkJggg==");
const black_knight = ("iVBORw0KGgoAAAANSUhEUgAAABkAAAAYCAQAAAClvJ5NAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAHdElNRQfmBQ8XFgXp0Tm0AAABw0lEQVQ4y73ST0gUYRjH8e/srNuOw+YfsM1t0UrSLcEOVh6sLC8KEZ2iWyzmIYLOQeQpvAkdZDt46BBk4alDZ+liCqkJgUYRCwpmdKgOq5vZ/jqs48zszpp46HlP7zvzeZ+Z53ngf4Tp24Wo4Q8FDJoJkd8LSTJOE2+4xAtqmNxLzla+kGOEecSCcSXcQuRf5BDvkbM68+PLwxPnr2KZu5C0uW7vkCO6rxlN5W6NkairAE6THdAzxYSHPdaS0i+JVwWACE/qtaDnqvIQZCmjWXU/IsD08bNaaZ3wAYQaNa3Md7O3tgTEeIUqrZta0oWnhP3kOhuVSYNmNbRCm9PvYo5Bor4rNskiZ/ONKc4lDnbFPaTL6r5Dpwt+McoEhnswzdHQsbNrHtIRtXs57jz/yj2GOelN+hGL5pRhuScDyFa4+OUz9AD9/PD+TVIfdHuRuEtamKNAAfGOU0CKt/4C1GpeD1ZpBbYL95kbdNBDOw9ZJMUYZ/wF/U2eWDWx8v7bQJLJ8jJH9VqjOS66WZzCbmJwl8vlo1FgC9PkgFsxNxJcC5rYEBFkFN8uJY0cDiImYTYoNrdkblgjgx2Esqzk+cT+4i9PPs91ZwLxQgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMi0wNC0xMVQxMzo0MjoyOSswMDowMKE+lOsAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjItMDQtMTFUMTM6NDI6MjkrMDA6MDDQYyxXAAAAAElFTkSuQmCC");
const black_pawn = ("iVBORw0KGgoAAAANSUhEUgAAABkAAAAYCAQAAAClvJ5NAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAHdElNRQfmBQ8XFgXp0Tm0AAAA+0lEQVQ4y82SO2pCURCGPx9FRMQHvgovWASTIqCRVCIo7sUd2NiYLMLaMrgHFyCBFMHSJp1BTSEmsVLHQnMfeo/nYuVUc2b4zsz/M3ClEVDU05RIsGDj9aMKQ36Y0yXmDYgwQBCEDc3Ttt8FSXJvdsvekBVLM//2slaQFr+HxYQRj3rkiZkJCEKfG91idVKOd5WcDjm2NURYh4zZOt5fTHVaMrzZlKxp49NNKTjkCgbJ8zMafDr8Era8klADBu9HwP5sXlTn66PjAgjChKJK+EiBCM+WCXb5D9wqV64RckPurPJJ5C3f7Ej2jJNxov9p0Fb+oKdE/lhweewApjhdRXMRggcAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjItMDQtMTFUMTM6NDI6MjkrMDA6MDChPpTrAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIyLTA0LTExVDEzOjQyOjI5KzAwOjAw0GMsVwAAAABJRU5ErkJggg==");
const black_queen = ("iVBORw0KGgoAAAANSUhEUgAAABkAAAAYCAQAAAClvJ5NAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAHdElNRQfmBQ8XFgXp0Tm0AAACkUlEQVQ4y53TS2jcVRTH8c/8ZzrTJhMzkaRW0iYxsU3Jo7GpiTRdVSuIFEvdCfHRRRdSJCBUFNSFIMVuXLsUKWJBXIioK2sRxYipGENriFibF5NHO0lM6kySuS4msRMUQc9dXO7h9+V3Dj8u/7niW15JGWuKYo56RsFEWe8fq8JbRrwuodmo4IpddjhvxGuSW6U7HNSIA+YE45rsMykYVa/TnOCGZjTrkoLIq3KuaFPnkuBTGZEBt5zCPb4SfKxKr6vmvQBpXwjWPYVWI86Cx83qA+cMasAZQfCRZOR3F2Vl/YQpyx5VgQ612lDjYQuyGHLThA8VIrzjtG16EIk8pAudOIBeD4jEcFhBvwtEKBqy4GWtiNzluGr70a7SCUlxHPKirGGhhDBvzF5npcXxmEN2o0mPY4jLeEW9axbuRLmm22Gtpj1op2rbdUtIqHRE3JSk58V94MvybE4JgnE3BcFtQVD0hyCYNSVYdXJrnH0WhX89MzpK0sQGcsOMKtiuRkaVhFVLbsnJlxRTprcis4bubTmi130qrFtVFEmKLPvFt742MyhXksZKV62VtnPvVXUP+tG4nLyiuJSMRl16ZC+/9Fzq13w58q4BLcf73t+VDmJiG+3SEjHj8988OX35TafLB3tWk5nx6ZV82t8QZpemJ+IbwJ1dXE+dGdi/8zvDJi0qCGKSqu3R5VhTY//bb2wMtDlYRqH3/k8O1nZpkLKmoCiSknDbdT+4emn6iaql0XKXR+Tqnk7nDfnMirikmGDVukotjjqx+/tMWDpf7tJuubK9v/Pkvo6766Jk4S+XpLX8fPbn4WsXshdr1j8vRza/dLx+z96Gltr6dHV823phMTc3+dvY5FhxcjPP/1l/As/476E+ipIBAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIyLTA0LTExVDEzOjQyOjI5KzAwOjAwoT6U6wAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMi0wNC0xMVQxMzo0MjoyOSswMDowMNBjLFcAAAAASUVORK5CYII=");
const black_rook = ("iVBORw0KGgoAAAANSUhEUgAAABkAAAAYCAQAAAClvJ5NAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAHdElNRQfmBQ8XFgXp0Tm0AAABeklEQVQ4y82TOy9DYRjHf69zqlXqklalSYOJmKQDhg4SicEkDGLwBYx8A6vV4DMYiBiIwWWo2aWJJkIcaVqXaLU0pT09fQ3S9tQ5kpp4n+W5vP/n8n/ywD99wqS30gXkyODAhwJkecOJD8EHKaQVvsgtGuu0ECbKDRorOJjmCo1t2u0qriCRPHPMGQYSSZJDLpFILvBWvqkVJcgrLgR4Ga8mCRD4UnSygFEPWSWS9OuGo2wzrkIhsVkUXAGgVAJRHmI7eX3M48zzbpIP7tnYPV2KJweJf2dMIN3D212T36sUctqUGolXbbUWklA6L9rQYlAwm02/3F2DEP4CotabzhrrNVqkDpTsIALpme0essyedu0FvJxUPeakamh5dN7dpFAvbtUI7h+RsWusMzaXVq2NwUuYETQrxO8YCLnabY5CUBLXvXf9JNC/7Ip/TSxMtPUpNndEgf1cSmOGa3MVgU92HPzMbBs9NNc3VmaLJ8o/QgRpHhtam937BDzIc01WQOBQAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIyLTA0LTExVDEzOjQyOjI5KzAwOjAwoT6U6wAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMi0wNC0xMVQxMzo0MjoyOSswMDowMNBjLFcAAAAASUVORK5CYII=");
const white_bishop = ("iVBORw0KGgoAAAANSUhEUgAAABkAAAAYCAQAAAClvJ5NAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAHdElNRQfmBQ8XFgXp0Tm0AAACBElEQVQ4y62RTUiTcRzHP8/L5t4Yz1wqbWKxVSJmha6g8FBQRAc75EEEL52EDkXUMSE8BnUQjxHdIroEXRISOlRCh1GHpJepkaQ4Y9PlXtzj8/w6LMcW21rQ9/Lny//74f///b7w36QTQP8XoNUzFY2772E0j4xetr/ImMVwrUu1JmLapoltstPsGwrnvCsD4l7mDEozgIcbJ78/lI/yQE4scw3X34AWfXJse0lE0iKSkNGCNoGzMXJpaCspIkm5KikRWZULGYYaAd7257MiEpdxicoVeS8iMxJ8hrv+xsI9RwaANmK0EiMIxOg+xt7KUHXDHr/LBXQyQp4RPIALnwtP/Y+F+z59lZLs32dCej7QURnSqpBcunV7sFe1yVMgT5417pgvpu0ZpLK2ahnq/YHhfWW7RPyxjLNZfxbwH4jcpq9s33E9suBrjAw6j75hrmxtWvo5xZNGSGdUPURL2RaIaPPh6oj2B/Kz2KsHDYeheBGS8jY793pzmvXKyO74DroI4UMjxGnOBtv2s0RqjVlessoOWyzzrbS3EtJlTBw+Hwp6HZrqxE+HFsEgzSJJK0MRy86ai6vzj3JTrJcQhVv9k8dJ58yigq6qimklMys/wnva/bpmiWULDqfb84qFm9zdRQ5qF60Un8kCOgomG2xgEEBH2AG8dGsB6ymJuo3W0m7mFySQxgcZsNqjAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIyLTA0LTExVDEzOjQyOjI5KzAwOjAwoT6U6wAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMi0wNC0xMVQxMzo0MjoyOSswMDowMNBjLFcAAAAASUVORK5CYII=");
const white_king = ("iVBORw0KGgoAAAANSUhEUgAAABkAAAAYCAQAAAClvJ5NAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAHdElNRQfmBQ8XFgXp0Tm0AAACPElEQVQ4y62Tz0uTcRzHX8/z7FlO52wrpURrK7W0FCHph5M6RNIlOngIpIPgKSPo0KEfhyKhg/4BhQYdyqJA6OBmOIiOBUEhkhb92CSmoiZubnPb4/PpoHOORizoc/ry+b5fvD+f95cv/LdScaL+C6CzjwFq0AtH2hhhFj+nCkfsHCeAl9L8M+erOE7KcREr3OXssZl+aZ3j3N9lJTTRRj02LDte+kUkIOU+tlFOC172Y8kIM4dm150W705bODrxfuFF2d5aoBbHgfm7de317mL9++JHX7KPYNahqvrtY4mIIUsyJufjpfE3IvJaqswbMikJScus9EvFGJUZQFGu3jRNydSiXJEeCckFGRRjs2vIdVGvoawnpjpOnFaUTUsXvSTpwkMX2mZXo53So6jriJjpVE4SZVxigc7sxgAskY4g64gZDQwbyZxrDwepyOlEeJaIj2Cy4Rz8VmM5dAQdWCbEFB8YYzcpoAgNWKZXhgaM+xiQWaHK3nex44z1HT9QsVOMyRorJCijlToerA4/TN7mF2QRcHDv5OVuGrCSIImgY0Njllc8nw/f4gmJ3KeECON7+EmAJEXYUEgTx2QXlchXhjIAOaFoX/DSgx2DFCY6VkxC+IiyJe3cHBtJMUgUDSuwRgoLbpoYVVbIj8SeGhFLN424NpAY0/jpJ7zMWlambEG2Kx3VnU3Nh51uxYlGjBmmVseDk6OJR0wg+RBUTDt1NODRXYpmrJhhPvOJcFb+B5Kd1kUJc8Tzfqzf54De3y+01L8AAAAldEVYdGRhdGU6Y3JlYXRlADIwMjItMDQtMTFUMTM6NDI6MjkrMDA6MDChPpTrAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIyLTA0LTExVDEzOjQyOjI5KzAwOjAw0GMsVwAAAABJRU5ErkJggg==");
const white_knight = ("iVBORw0KGgoAAAANSUhEUgAAABkAAAAYCAQAAAClvJ5NAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAHdElNRQfmBQ8XFgXp0Tm0AAACAUlEQVQ4y72TS2hTQRSGvxsToolJ1DZ6+3ChIWhEC8UKgqkWgt1IiqLFoqE+sCBScCHiUtBdF65qQEQwoCJIg4j4BBWk3dhFVyJW6kIrRWpbalpjc3OPi3vtfSTFrvw3M+fMfOfMnDMD/0MrHJZCLTqaFz2Gn8JyAqz3vfT2E6S15sOqG8vLWR//lNa4VTd8XTaPkaGJoOcfSKhh6IlkJS8/JSfntfbv6gtOEVkaUDh2aHZcLM3KW+lZWPOQrUshie2jl+SwTIpdRbkpDUPEqwG+ldk+SUmnzJubddHNMSvh+6yuRNr2T03IUxkzgQXJyldzPi/Hixx1A4HIwIDjQB8lvYiIvJLoM4JOJH1kruC4+AnplvKiXZADM+w2thplD6zrOROwgkxzWbv7Ply2ehKkNULSjjTv2jfCG3N5lN5i/zXtjuro4k7CLXgtZMuO8CTfKKHziMz4vQulK6GmZsWObEKNE7LsjtNaQa5Kn+REHWRPCFLtP6Yc5ZiW5BditucYfdw5t7GcktgICSDR+O65OPVbDs7QYs8bZS8X/Q9IAtvqBnO2ahkqy8lfpFytUcHrgcYNr29XACIivSU6rOsDMAGa7vGdPdeWodqT93nwuxAAamLpbtdX/Su/Yix4Xf7acn3eCFahYQUdQHH519JFmOrSyPO5EgGUak4wUgB/AJoDQwrq3iMhAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIyLTA0LTExVDEzOjQyOjI5KzAwOjAwoT6U6wAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMi0wNC0xMVQxMzo0MjoyOSswMDowMNBjLFcAAAAASUVORK5CYII=");
const white_pawn = ("iVBORw0KGgoAAAANSUhEUgAAABkAAAAYCAQAAAClvJ5NAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAHdElNRQfmBQ8XFgXp0Tm0AAABW0lEQVQ4y82RvUtCYRTGf9erqdmXDtrHIIYigRIU6mD0NdTQ1xxF4NrQ1tbUf9BWQwQtQX9Fc0IgRFAUmg0tXYcwrC56mroavnUde6b3vC+/95znOfBPpasuuzHDZAhgUO/sG42V+E3ufcHwHtDXGRKMXF1IXQzZMFlvf3YokMFYOI2DALNOEp0hb3fVB8DkEoxOEI97e27QD0CWyBZJeyeLy9WKfOtIfCe4bLro82s+v1UtE50iaIM4elpz9dLtwW2DmNd5Eau65bHIi52XkeHCuZgi0pCiLH2Qs0tMJ+vpv+cTgDI1rStN6K8OGpuzlbw0rMQM2ZPeMwK/I+PJUkF+qiY7dX1PuXLA6Tk6lHaVZKLMmBqJpZ6eRaV90XbV9iczQ2qnM/inm9tpQbR4QteUSJShUfqt+VuQUIFTJVKlNoCvGWtTq1pK3QUarxxTaUdw4USUyCcN6/wFOCikp/NqhqIAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjItMDQtMTFUMTM6NDI6MjkrMDA6MDChPpTrAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIyLTA0LTExVDEzOjQyOjI5KzAwOjAw0GMsVwAAAABJRU5ErkJggg==");
const white_queen = ("iVBORw0KGgoAAAANSUhEUgAAABkAAAAYCAQAAAClvJ5NAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAHdElNRQfmBQ8XFgXp0Tm0AAAC5UlEQVQ4y6WTW2hUVxSGv7PPnJzJ3JzJJCF3TZxMWoOpRhEqXtIohhpIjagoSpWiIIhKQURfVBB8qRQULAgDLfogSB4En0orCoLEFgStaHRoVEZj4i1jkrmfc5YPY4iJeSj0f9qs/X+L/bPXgv8nxTfoxWMFq6j+L8R64xc2oTOnou+7VM3vVAJNbKEFbYbXgwFQ98VATNqf08y8JUN/yaokbYRqr+22G/upARfej51hfuZkYR9+bCs/hpVDGHpwYWvqziX+JVgZ3a5qmimj1PohfYoFAC5v7LhsLrANjXUkOIgCFpOgAzCMY+H35glMvu3OnJJQH24FmnKhg4bwN0nqAYiUVGlRoFAYfvs6FyOHpjDQVDFVVJ0hQRcQ9t0PPqYWzBOd4jsL+Mxr5jPqgK95qs7TNpm/lJv8QZCy1nu9Nt+jKvp+loY/KaFj5UTbIHV46OMuwcn4kDPjkU59J2JIjyrfSHVl8wqqG6kq3dTrDQi2tjnS4xkkNYU4drxbtf/IYttextLlrJ9b1UJjBWtau9biOLS0Hu41nDiFKQQrrtv753qOWP4QPeXagWgwwJce9nfPq8MyjUN7F/jIxqf/5tINyXHZ7jRZCbkvtXJa3klMwnJTXslCu9sek10Z1hStro/Iy4dvfpujtHH9EBDgKrdIEuY0OiOqgRh3RklMR5KDL/rnd7CVIH68KDQEIcU4exjiFo9HeDMdSTsX0u0rfA5JhsliI2jomHipJ8KNrH2RZNE6NaGGdix6dJHux40bHQ3BJkuOCe45A+fsw2RnItAQuf5rU4AUWSwcFC7ceMizZ/huJw8nba5PkIXpsp/wUIKJgYZgkSNHllE/rQwgMxcsWH3jiozIhOTFFkdEHLElLxPySi5L6Crm5zu5uis9KrPriXyVIPL5wxL/3N7RVukNGQHlxkTHIUuOMSdZGMm8fFScr5nxw9RTTgg/HgwUQp4M44zylgSvZ0M+UbEss959AHFnKCTonfUUAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIyLTA0LTExVDEzOjQyOjI5KzAwOjAwoT6U6wAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMi0wNC0xMVQxMzo0MjoyOSswMDowMNBjLFcAAAAASUVORK5CYII=");
const white_rook =  ("iVBORw0KGgoAAAANSUhEUgAAABkAAAAYCAQAAAClvJ5NAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAHdElNRQfmBQ8XFgXp0Tm0AAABq0lEQVQ4y82TvUtbURjGf+fGGy+JiZ/FhLSJSipUqINd2kXBQXBQ6Vakf4RDLHTo4uDmpFBoh9Z/ohXrIviBSymFgrkK4qDGj2o1NjEk+jr4wb0n12bp4HuW876c57zP+5znwD0N5dgHCQNZTjFpwACOyVFNPYo8x0g5+k1bOmkzjkVf068uO55mBIvh6GqH7Z/G8mhoTn2Wr5LIxOYiP1OyK58kuhn7FrEnZFkeLVFzc67KCTqjlcnmYrMiRo5nvI+fxw1aOEIcpByQ4s6YfFEhAAQBjKs6P8hkKHl1+bD/uOn1kM/QCH9ndrH0joKXYhCNzkx2JlylPKN/VgZY8CQGnFgnT2nXILUF9pwVnQUXWn6OaKfKIJXjf0BUhVwfnxIH1DvMpPhLAbe73JA6s9Hmt3aJBIiQ9oYESAXb9znSiARDvGWdLa9ZGlpfDvv8GNrq50UvT8q7KB7SEfT3UOuh0Twk2WTjymc3gpjW9PP+cDhsGB4/6ZSz7Ip9OMi2s4tR/aC7LnHt4HLh86G1yKHplt3HK1+n4q4QLnblI1nXSykC/7CCkLt13yWSkXnbI7+B+QAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMi0wNC0xMVQxMzo0MjoyOSswMDowMKE+lOsAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjItMDQtMTFUMTM6NDI6MjkrMDA6MDDQYyxXAAAAAElFTkSuQmCC");

export class Images {
    private black_bishop: Option<Jimp>;
    private black_king: Option<Jimp>;
    private black_knight: Option<Jimp>;
    private black_pawn: Option<Jimp>;
    private black_queen: Option<Jimp>;
    private black_rook: Option<Jimp>;
    private white_bishop: Option<Jimp>;
    private white_king: Option<Jimp>;
    private white_knight: Option<Jimp>;
    private white_pawn: Option<Jimp>;
    private white_queen: Option<Jimp>;
    private white_rook: Option<Jimp>;

    constructor() {
        this.black_bishop = null;
        this.black_king = null;
        this.black_knight = null;
        this.black_pawn = null;
        this.black_queen = null;
        this.black_rook = null;
        this.white_bishop = null;
        this.white_king = null;
        this.white_knight = null;
        this.white_pawn = null;
        this.white_queen = null;
        this.white_rook = null;
    }

    public async blackBishop() {
        if (issome(this.black_bishop)) {
            return this.black_bishop;
        }
        this.black_bishop = await buffer(black_bishop);
        return this.black_bishop;
    }
    public async blackKing() {
        if (issome(this.black_king)) {
            return this.black_king;
        }
        this.black_king = await buffer(black_king);
        return this.black_king;
    }
    public async blackKnight() {
        if (issome(this.black_knight)) {
            return this.black_knight;
        }
        this.black_knight = await buffer(black_knight);
        return this.black_knight;
    }
    public async blackPawn() {
        if (issome(this.black_pawn)) {
            return this.black_pawn;
        }
        this.black_pawn = await buffer(black_pawn);
        return this.black_pawn;
    }
    public async blackQueen() {
        if (issome(this.black_queen)) {
            return this.black_queen;
        }
        this.black_queen = await buffer(black_queen);
        return this.black_queen;
    }
    public async blackRook() {
        if (issome(this.black_rook)) {
            return this.black_rook;
        }
        this.black_rook = await buffer(black_rook);
        return this.black_rook;
    }
    public async whiteBishop() {
        if (issome(this.white_bishop)) {
            return this.white_bishop;
        }
        this.white_bishop = await buffer(white_bishop);
        return this.white_bishop;
    }
    public async whiteKing() {
        if (issome(this.white_king)) {
            return this.white_king;
        }
        this.white_king = await buffer(white_king);
        return this.white_king;
    }
    public async whiteKnight() {
        if (issome(this.white_knight)) {
            return this.white_knight;
        }
        this.white_knight = await buffer(white_knight);
        return this.white_knight;
    }
    public async whitePawn() {
        if (issome(this.white_pawn)) {
            return this.white_pawn;
        }
        this.white_pawn = await buffer(white_pawn);
        return this.white_pawn;
    }
    public async whiteQueen() {
        if (issome(this.white_queen)) {
            return this.white_queen;
        }
        this.white_queen = await buffer(white_queen);
        return this.white_queen;
    }
    public async whiteRook() {
        if (issome(this.white_rook)) {
            return this.white_rook;
        }
        this.white_rook = await buffer(white_rook);
        return this.white_rook;
    }
}

async function buffer (str: string) {
    return await Jimp.read(Buffer.from(decode(str)));
}
