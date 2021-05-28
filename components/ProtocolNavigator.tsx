import React, { useCallback, useEffect, useState } from "react";
import Breadcrumbs from "./Breadcrumbs";
import ProtocolLink from "./ProtocolLink";

const stripDefinitionPrefix = ($ref?: string) =>
  $ref?.replace("#/definitions/", "") ?? "";

type Props = {
  httpObj?: API.HTTPObject;
};
const ProtocolNavigator: React.FC<Props> = ({ httpObj }) => {
  const protocolMap: Record<string, API.Protocol> =
    httpObj?.schema?.definitions ?? {};
  const [protocolStack, setProtocolStack] = useState<string[]>([]);
  const protocolKey = protocolStack[protocolStack.length - 1];
  const protocol = protocolMap[protocolKey] as API.Protocol;

  useEffect(() => {
    setProtocolStack([stripDefinitionPrefix(httpObj?.schema?.$ref)]);
  }, [httpObj]);

  const push = useCallback(
    (protocol: string) => {
      const newStack = protocolStack.slice();
      newStack.push(protocol);
      setProtocolStack(newStack);
    },
    [protocolStack, setProtocolStack]
  );

  const navigate = useCallback(
    (crumbIndex: number) => {
      const newStack = protocolStack.slice();
      newStack.splice(crumbIndex + 1);
      setProtocolStack(newStack);
    },
    [protocolStack, setProtocolStack]
  );

  return httpObj ? (
    <>
      <Breadcrumbs stack={protocolStack} onCrumbClicked={navigate} />
      <div key={protocolKey} className="container mx-auto rounded my-3 flex">
        <div className="hidden md:flex flex-col items-end w-40 text-right text-1xl text-blue-800 font-mono font-semibold mr-3 p-3">
          <h3 className="mb-6 leading-8">Name</h3>
          <h3 className="mt-2">Properties</h3>
        </div>

        <div className="flex-grow shadow-md rounded p-3">
          <p className="mb-6 font-semibold tracking-wide text-2xl">
            {protocolKey}
          </p>
          <table>
            <tbody>
              {Object.keys(protocol?.properties ?? {})
                .sort((a, b) => {
                  const propA = protocol?.properties?.[a];
                  const propB = protocol?.properties?.[b];
                  return propA?.$ref && !propB?.$ref
                    ? -2
                    : propB?.$ref && !propA?.$ref
                    ? 2
                    : a.localeCompare(b);
                })
                .map((propertyKey) => {
                  const property = protocol?.properties?.[propertyKey];
                  const ref = stripDefinitionPrefix(
                    property?.$ref ?? property?.items?.$ref
                  );
                  return (
                    <tr key={propertyKey} className="h-12">
                      <td className="pr-3">{propertyKey}</td>
                      <td>
                        <span className="text-blue-800">
                          {property?.type ?? "object"}
                        </span>
                      </td>
                      <td>
                        {ref ? (
                          <ProtocolLink onClick={() => push(ref)}>
                            {ref}
                          </ProtocolLink>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  ) : null;
};

export default React.memo(ProtocolNavigator);
