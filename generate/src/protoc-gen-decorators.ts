import {createEcmaScriptPlugin, GeneratedFile, Schema, runNodeJs} from "@bufbuild/protoplugin";
import { getFieldAsAParameter, getFieldTsType } from "./tools";

export default function generateDecorators(schema: Schema): void {
    // only run with services files
    if (schema.proto.fileToGenerate.filter(filename => filename.includes("/services/")).length == 0) {
        return;
    }

    const decoratorFile = schema.generateFile(`decorators/decorators.ts`);
    decoratorFile.print("import {OlvidClient, datatypes} from '../../olvid';");
    decoratorFile.print("import {create} from \"@bufbuild/protobuf\";\n");

    // generate command (constant code)
    generateCommand(decoratorFile);

    // generate decorators
    schema.files.forEach(file => {
        file.services.forEach(service => {
            if (!service.name.endsWith("NotificationService")) {
                return;
            }

            service.methods.forEach(method => {
                const optionsParameters: string = `options?: {${method.input.fields.map(field => getFieldAsAParameter(field)).join(", ")}}`;
                const outputParameters: string = method.output.fields.map(f => `${f.name}: ${getFieldTsType(f)}`).join(",");
                const targetParameters: string = `this: This, ` + outputParameters;
                const passOutputParameters: string = method.output.fields.map(f => f.name).join(",");
                const stubMethodName: string = `on${method.name}`

                decoratorFile.print`
// ${service.name}: ${method.name}
// noinspection JSUnusedGlobalSymbols
export function on${method.name}(${optionsParameters}) {
    return function <This extends OlvidClient>(
        target: (${targetParameters}) => Promise<void>,
        context: ClassMethodDecoratorContext<
            This,
            (${targetParameters}) => Promise<void>
        >
    ) {
        context.addInitializer(function (this: This) {
            this.${stubMethodName}({
                ...options,
                callback: async (${outputParameters}) => {
                    await target.call(this, ${passOutputParameters});
                },
            });
        });
    };
}
`
            })
        })
    })
}

function generateCommand(decoratorFile: GeneratedFile) {
    decoratorFile.print`// Custom decorators
export function command(regexp_filter: string) {
  return function <This extends OlvidClient>(
    target: (
      message: datatypes.Message,
      cmd_parameters: string
    ) => Promise<void>,
    context: ClassMethodDecoratorContext<
      This,
      (
        message: datatypes.Message,
        args: string
      ) => Promise<void>
    >
  ) {
    // Build the regex for the command (with optional aliases)
    context.addInitializer(function (this: This) {
      this.onMessageReceived({
        filter: create(datatypes.MessageFilterSchema, { bodySearch: regexp_filter }),
        callback: async (message: datatypes.Message) => {
          const cmd_parameters = message.body.replace(
            new RegExp(regexp_filter),
            ""
          );
          await target.call(this, message, cmd_parameters);
        },
      });
    });
  };
}`
}

const plugin = createEcmaScriptPlugin({
    name: "protoc-gen-decorators",
    version: process.env.npm_package_version ?? "1.0.0",

    generateTs: function (schema: Schema): void {
        generateDecorators(schema);
    }
});

runNodeJs(plugin);
