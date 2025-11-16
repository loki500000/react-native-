/**
 * Detect component types from Figma nodes
 * Identifies buttons, images, inputs, etc.
 */

export class ComponentDetector {
  /**
   * Detect if a node should be a Pressable/TouchableOpacity
   */
  isPressable(node: any): boolean {
    const name = node.name.toLowerCase();

    // Check naming patterns
    if (name.includes('button') || name.includes('btn')) {
      return true;
    }

    if (name.includes('pressable') || name.includes('touchable')) {
      return true;
    }

    // Check for interactive patterns (card, item with onPress suffix)
    if (name.match(/(card|item|row).*press/i)) {
      return true;
    }

    // Check if it has prototype interactions (future enhancement)
    if (node.reactions && node.reactions.length > 0) {
      return true;
    }

    return false;
  }

  /**
   * Detect if a node should be an Image component
   */
  isImage(node: any): boolean {
    // Vector, boolean operations, or nodes with image fills
    if (node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION') {
      return true;
    }

    // Rectangle or frame with image fill
    if (node.fills && Array.isArray(node.fills)) {
      const hasImageFill = node.fills.some((fill: any) =>
        fill.type === 'IMAGE' && fill.visible !== false
      );
      if (hasImageFill) {
        return true;
      }
    }

    // Check naming
    const name = node.name.toLowerCase();
    if (name.includes('image') || name.includes('img') ||
        name.includes('icon') || name.includes('logo') ||
        name.includes('avatar') || name.includes('photo')) {
      return true;
    }

    return false;
  }

  /**
   * Detect if a node should be a TextInput
   */
  isTextInput(node: any): boolean {
    const name = node.name.toLowerCase();

    if (name.includes('input') || name.includes('textfield') ||
        name.includes('textbox') || name.includes('field')) {
      return true;
    }

    // Check if it's a text node with editable styling
    if (node.type === 'TEXT' && name.includes('edit')) {
      return true;
    }

    return false;
  }

  /**
   * Detect if a node should be a ScrollView
   */
  isScrollView(node: any): boolean {
    const name = node.name.toLowerCase();

    if (name.includes('scroll') || name.includes('list')) {
      return true;
    }

    // Check if it has overflow scrolling enabled
    if (node.overflowDirection) {
      return true;
    }

    // Very tall frames might need scrolling
    if (node.type === 'FRAME' && node.absoluteBoundingBox) {
      const height = node.absoluteBoundingBox.height;
      // Arbitrarily large height suggests scrollable content
      if (height > 1000) {
        return true;
      }
    }

    return false;
  }

  /**
   * Detect if a node is a FlatList/SectionList
   */
  isList(node: any): boolean {
    const name = node.name.toLowerCase();

    if (name.includes('flatlist') || name.includes('list')) {
      return true;
    }

    // Check if it has repeated children (list pattern)
    if (node.children && node.children.length > 3) {
      const childTypes = node.children.map((c: any) => c.type);
      const allSameType = childTypes.every((t: any) => t === childTypes[0]);

      if (allSameType && node.layoutMode) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get the appropriate React Native component type
   */
  getComponentType(node: any): string {
    if (this.isTextInput(node)) {
      return 'TextInput';
    }

    if (this.isPressable(node)) {
      return 'TouchableOpacity';
    }

    if (this.isImage(node)) {
      return 'Image';
    }

    if (this.isList(node)) {
      return 'FlatList';
    }

    if (this.isScrollView(node)) {
      return 'ScrollView';
    }

    // Default types
    if (node.type === 'TEXT') {
      return 'Text';
    }

    return 'View';
  }

  /**
   * Check if component needs additional props
   */
  getRequiredProps(node: any, componentType: string): Record<string, any> {
    const props: Record<string, any> = {};

    if (componentType === 'TouchableOpacity') {
      props.activeOpacity = 0.7;
      props.onPress = '() => {}'; // Placeholder
    }

    if (componentType === 'Image') {
      // Check for image source
      if (node.fills && node.fills[0]?.imageRef) {
        props.source = `{ uri: 'IMAGE_URL' }`; // Placeholder
      } else {
        props.source = `require('./assets/placeholder.png')`;
      }
      props.resizeMode = 'cover';
    }

    if (componentType === 'TextInput') {
      props.placeholder = `"${node.name}"`;
      props.value = '""';
      props.onChangeText = '() => {}';
    }

    if (componentType === 'FlatList') {
      props.data = '[]';
      props.renderItem = '() => null';
      props.keyExtractor = '(item) => item.id';
    }

    return props;
  }
}
