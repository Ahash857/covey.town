"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const tsoa_1 = require("tsoa");
const promises_1 = __importDefault(require("fs/promises"));
const socket_io_1 = require("socket.io");
const routes_1 = require("../generated/routes");
const TownsStore_1 = __importDefault(require("./lib/TownsStore"));
const TownsController_1 = require("./town/TownsController");
const Utils_1 = require("./Utils");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const server = http.createServer(app);
const socketServer = new socket_io_1.Server(server, {
    cors: { origin: '*' },
});
TownsStore_1.default.initializeTownsStore((townID) => socketServer.to(townID));
socketServer.on('connection', socket => {
    new TownsController_1.TownsController().joinTown(socket);
});
app.use(express_1.default.json());
app.use('/docs', swagger_ui_express_1.default.serve, async (_req, res) => {
    const swaggerSpec = await promises_1.default.readFile('../shared/generated/swagger.json', 'utf-8');
    return res.send(swagger_ui_express_1.default.generateHTML(JSON.parse(swaggerSpec)));
});
(0, routes_1.RegisterRoutes)(app);
app.use((err, _req, res, next) => {
    if (err instanceof tsoa_1.ValidateError) {
        return res.status(422).json({
            message: 'Validation Failed',
            details: err === null || err === void 0 ? void 0 : err.fields,
        });
    }
    if (err instanceof Error) {
        (0, Utils_1.logError)(err);
        return res.status(500).json({
            message: 'Internal Server Error',
        });
    }
    return next();
});
server.listen(process.env.PORT || 8081, () => {
    const address = server.address();
    console.log(`Listening on ${address.port}`);
    if (process.env.DEMO_TOWN_ID) {
        TownsStore_1.default.getInstance().createTown(process.env.DEMO_TOWN_ID, false);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1NlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0RBQThCO0FBQzlCLDJDQUE2QjtBQUM3QixnREFBd0I7QUFFeEIsNEVBQTJDO0FBQzNDLCtCQUFxQztBQUNyQywyREFBNkI7QUFDN0IseUNBQW1EO0FBQ25ELGdEQUFxRDtBQUNyRCxrRUFBMEM7QUFFMUMsNERBQXlEO0FBQ3pELG1DQUFtQztBQUduQyxNQUFNLEdBQUcsR0FBRyxJQUFBLGlCQUFPLEdBQUUsQ0FBQztBQUN0QixHQUFHLENBQUMsR0FBRyxDQUFDLElBQUEsY0FBSSxHQUFFLENBQUMsQ0FBQztBQUNoQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sWUFBWSxHQUFHLElBQUksa0JBQVksQ0FBNkMsTUFBTSxFQUFFO0lBQ3hGLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUU7Q0FDdEIsQ0FBQyxDQUFDO0FBR0gsb0JBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLE1BQWMsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBSTdFLFlBQVksQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxFQUFFO0lBQ3JDLElBQUksaUNBQWUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN6QyxDQUFDLENBQUMsQ0FBQztBQUdILEdBQUcsQ0FBQyxHQUFHLENBQUMsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBR3hCLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLDRCQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFxQixFQUFFLEdBQXFCLEVBQUUsRUFBRTtJQUN2RixNQUFNLFdBQVcsR0FBRyxNQUFNLGtCQUFFLENBQUMsUUFBUSxDQUFDLGtDQUFrQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ25GLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyw0QkFBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuRSxDQUFDLENBQUMsQ0FBQztBQUdILElBQUEsdUJBQWMsRUFBQyxHQUFHLENBQUMsQ0FBQztBQUdwQixHQUFHLENBQUMsR0FBRyxDQUNMLENBQ0UsR0FBWSxFQUNaLElBQXFCLEVBQ3JCLEdBQXFCLEVBQ3JCLElBQTBCLEVBQ0QsRUFBRTtJQUMzQixJQUFJLEdBQUcsWUFBWSxvQkFBYSxFQUFFO1FBQ2hDLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDMUIsT0FBTyxFQUFFLG1CQUFtQjtZQUM1QixPQUFPLEVBQUUsR0FBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFFLE1BQU07U0FDckIsQ0FBQyxDQUFDO0tBQ0o7SUFDRCxJQUFJLEdBQUcsWUFBWSxLQUFLLEVBQUU7UUFDeEIsSUFBQSxnQkFBUSxFQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUMxQixPQUFPLEVBQUUsdUJBQXVCO1NBQ2pDLENBQUMsQ0FBQztLQUNKO0lBRUQsT0FBTyxJQUFJLEVBQUUsQ0FBQztBQUNoQixDQUFDLENBQ0YsQ0FBQztBQUdGLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsRUFBRTtJQUMzQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFpQixDQUFDO0lBRWhELE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzVDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUU7UUFDNUIsb0JBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDdEU7QUFDSCxDQUFDLENBQUMsQ0FBQyJ9