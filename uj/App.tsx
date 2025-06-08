import React, { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Switch,
  Tooltip
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { FileUploader } from "./components/file-uploader";
import { CodeEditor } from "./components/code-editor";
import { ConversionOptions } from "./components/conversion-options";
import { useConverter } from "./hooks/use-converter";
import { useTheme } from "./hooks/use-theme";
import { useToast } from "./hooks/use-toast";
import { validateSvg } from "./utils/svg-utils";
import { SVGPreview } from "./components/svg-preview";
import { NavigationBar } from "./components/navigation-bar";
import { SVGAnalyzer } from "./components/svg-analyzer";

const App: React.FC = () => {
  const {
    svgInput,
    setSvgInput,
    jsxOutput,
    fileName,
    setFileName,
    options,
    setOptions,
    convertSvgToJsx,
    copyToClipboard,
    downloadFile,
    copied
  } = useConverter();
  
  const { isDarkMode, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [isConverting, setIsConverting] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(true);

  // Handle file selection with validation
  const handleFileSelect = (content: string, name: string) => {
    const validation = validateSvg(content);
    
    if (!validation.isValid) {
      toast({
        title: "Érvénytelen SVG",
        description: validation.error,
        variant: "danger"
      });
      return;
    }

    setSvgInput(content);
    
    // Auto-generate component name from filename
    const baseName = name.replace(/\.svg$/, '');
    const componentName = baseName
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
    
    setFileName(componentName || "SvgIcon");
    
    toast({
      title: "SVG betöltve",
      description: `${name} sikeresen betöltve`,
      variant: "success"
    });
  };

  // Enhanced conversion with loading state
  const handleConvert = async () => {
    if (!svgInput.trim()) {
      toast({
        title: "Nincs SVG tartalom",
        description: "Kérlek tölts fel egy SVG fájlt vagy illeszd be a kódot",
        variant: "danger"
      });
      return;
    }

    setIsConverting(true);
    
    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      convertSvgToJsx();
      
      toast({
        title: "Konverzió sikeres",
        description: "Az SVG sikeresen átalakítva JSX komponenssé",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Konverziós hiba",
        description: "Hiba történt az SVG átalakítása során",
        variant: "danger"
      });
    } finally {
      setIsConverting(false);
    }
  };

  // Enhanced clipboard copy with toast
  const handleCopy = async () => {
    await copyToClipboard();
    
    toast({
      title: "Másolva",
      description: "A JSX kód a vágólapra másolva",
      variant: "success"
    });
  };

  // Enhanced download with toast
  const handleDownload = (extension: string) => {
    downloadFile(extension);
    
    toast({
      title: "Letöltés megkezdve",
      description: "A JSX fájl letöltése elkezdődött",
      variant: "success"
    });
  };

  return (
    <div className={`min-h-screen bg-background flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      {/* Replace header with NavigationBar */}
      <NavigationBar options={options} onOptionsChange={setOptions} />

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col gap-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            SVG to JSX Converter
          </h2>
          <p className="text-default-500 text-lg">
            Alakítsd át egyszerűen az SVG fájljaidat React JSX komponensekké
          </p>
        </div>
        
        {/* File upload section */}
        <Card className="w-full">
          <CardBody className="p-0">
            <FileUploader onFileSelect={handleFileSelect} />
          </CardBody>
        </Card>

        {/* SVG Analysis - New Section */}
        {svgInput && (
          <SVGAnalyzer svgContent={svgInput} />
        )}

        {/* Convert button */}
        <div className="flex justify-center">
          <Button 
            color="primary" 
            size="lg" 
            startContent={isConverting ? 
              <Icon icon="lucide:refresh-cw" className="animate-spin" /> : 
              <Icon icon="lucide:settings" />
            }
            onPress={handleConvert}
            isDisabled={!svgInput.trim() || isConverting}
            className="transform transition-transform hover:scale-105 shadow-md"
          >
            {isConverting ? "Konvertálás..." : "Konvertálás"}
          </Button>
        </div>

        {/* Editor section - now with 3 columns */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Input section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary shadow-sm"></div>
              <h2 className="text-lg font-medium">Input</h2>
              <Chip size="sm" variant="flat" color="primary">SVG</Chip>
            </div>

            <Card className="shadow-md">
              <CardHeader className="flex justify-between items-center">
                <h3 className="text-sm font-medium">SVG Code (Editable)</h3>
                <Chip size="sm" variant="flat" color="default">svg</Chip>
              </CardHeader>
              <Divider />
              <CardBody className="p-0">
                <CodeEditor 
                  code={svgInput} 
                  language="svg" 
                  onChange={setSvgInput} 
                />
              </CardBody>
            </Card>
          </div>

          {/* Preview section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary shadow-sm"></div>
              <h2 className="text-lg font-medium">Preview</h2>
              <Chip size="sm" variant="flat" color="secondary">LIVE</Chip>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="ml-auto"
                onPress={() => setPreviewVisible(!previewVisible)}
                aria-label={previewVisible ? "Hide preview" : "Show preview"}
              >
                <Icon 
                  icon={previewVisible ? "lucide:eye-off" : "lucide:eye"} 
                  size={16} 
                />
              </Button>
            </div>
            
            <SVGPreview 
              svgContent={svgInput}
              isVisible={previewVisible}
              onToggleVisibility={() => setPreviewVisible(!previewVisible)}
            />
          </div>

          {/* Output section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success shadow-sm"></div>
              <h2 className="text-lg font-medium">Output</h2>
              <Chip size="sm" variant="flat" color="success">JSX</Chip>
            </div>

            {jsxOutput ? (
              <>
                <Card className="shadow-md">
                  <CardHeader className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">React Component</h3>
                    <Chip size="sm" variant="flat" color="default">
                      {options.typescript ? "tsx" : "jsx"}
                    </Chip>
                  </CardHeader>
                  <Divider />
                  <CardBody className="p-0">
                    <CodeEditor 
                      code={jsxOutput} 
                      language="jsx" 
                      readOnly 
                    />
                  </CardBody>
                  <Divider />
                  <CardFooter className="flex justify-between">
                    <Input
                      label="Component Name"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="max-w-[200px]"
                      size="sm"
                      startContent={<Icon icon="lucide:file" className="text-default-400" />}
                    />
                    <div className="flex gap-2">
                      <Tooltip content={copied ? "Copied!" : "Copy to clipboard"}>
                        <Button
                          color="default"
                          variant="flat"
                          startContent={
                            <Icon 
                              icon={copied ? "lucide:check" : "lucide:copy"} 
                              className={copied ? "text-success" : ""} 
                            />
                          }
                          onPress={handleCopy}
                          className="transition-transform hover:scale-105"
                        >
                          {copied ? "Másolva" : "Másolás"}
                        </Button>
                      </Tooltip>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            color="primary"
                            startContent={<Icon icon="lucide:download" />}
                            className="transition-transform hover:scale-105"
                          >
                            Letöltés
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Download options">
                          <DropdownItem 
                            key="tsx" 
                            onPress={() => handleDownload(options.typescript ? "tsx" : "jsx")}
                          >
                            As {options.typescript ? ".tsx" : ".jsx"}
                          </DropdownItem>
                          <DropdownItem 
                            key="js" 
                            onPress={() => handleDownload("js")}
                          >
                            As .js
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </CardFooter>
                </Card>
              </>
            ) : (
              <Card className="h-[400px] flex items-center justify-center shadow-md">
                <CardBody className="text-center">
                  <div className="text-default-400 mb-4">
                    <Icon icon="lucide:settings" className="w-12 h-12 mx-auto opacity-50" />
                  </div>
                  <p className="text-default-500 text-lg">Click "Konvertálás" to convert your SVG to JSX</p>
                  <p className="text-default-400 text-sm mt-2">Your React component will appear here</p>
                </CardBody>
              </Card>
            )}
          </div>
        </div>

        {/* Conversion details */}
        {jsxOutput && (
          <Card className="mt-6 shadow-md">
            <CardHeader>
              <h3 className="text-lg font-medium">Conversion Details</h3>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-content2 rounded-lg p-4 transform transition-transform hover:scale-105">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {(svgInput.match(/\w+=/g) || []).length}
                  </div>
                  <div className="text-sm text-default-500">Attributes Converted</div>
                </div>
                <div className="bg-content2 rounded-lg p-4 transform transition-transform hover:scale-105">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {(svgInput.match(/<path/g) || []).length}
                  </div>
                  <div className="text-sm text-default-500">Path Elements</div>
                </div>
                <div className="bg-content2 rounded-lg p-4 transform transition-transform hover:scale-105">
                  <div className="text-xl font-bold text-primary mb-1">
                    {options.typescript ? "TypeScript" : "JavaScript"}
                  </div>
                  <div className="text-sm text-default-500">Output Format</div>
                </div>
                <div className="bg-content2 rounded-lg p-4 transform transition-transform hover:scale-105">
                  <div className="text-xl font-bold text-primary mb-1">
                    {options.memo ? "memo()" : "Component"}
                  </div>
                  <div className="text-sm text-default-500">Component Type</div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </main>
    </div>
  );
};

export default App;