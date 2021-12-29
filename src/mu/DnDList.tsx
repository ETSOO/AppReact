import { DataTypes } from '@etsoo/shared';
import React, { CSSProperties } from 'react';
import {
    DragDropContext,
    Draggable,
    Droppable,
    DropResult
} from 'react-beautiful-dnd';

/**
 * DnD list props
 */
export interface DnDListProps<
    D extends {},
    L extends keyof D,
    E extends React.ElementType
> {
    /**
     * Item renderer
     */
    children: (
        item: D,
        index: number,
        onDelete: (index: number) => void
    ) => React.ReactNode;

    /**
     * List container component
     * https://javascript.plainenglish.io/building-a-polymorphic-component-in-react-and-typescript-d9f236950af4
     */
    Component?: E;

    /**
     * List container props
     */
    componentProps?: React.ComponentProps<E>;

    /**
     * Get list item style callback
     */
    getItemStyle?: (isDragging: boolean) => CSSProperties;

    /**
     * Get list style callback
     */
    getListStyle?: (isDraggingOver: boolean) => CSSProperties;

    /**
     * Label field
     */
    labelField: L;

    /**
     * Load data
     */
    loadData: (name: string) => PromiseLike<D[]>;

    /**
     * Top and bottom sides renderer
     */
    sideRenderer?: (
        top: boolean,
        onAdd: (item: D) => boolean
    ) => React.ReactNode;

    /**
     * Name for hidden form input
     */
    name: string;
}

/**
 * Drag and drop list
 * @param props Props
 * @returns Component
 */
export function DnDList<
    D extends {},
    L extends keyof D,
    E extends React.ElementType = React.ElementType
>(props: DnDListProps<D, L, E>) {
    // Destruct
    const {
        children,
        Component = 'div',
        componentProps,
        getItemStyle = (_isDragging) => ({}),
        getListStyle = () => undefined,
        labelField,
        loadData,
        name,
        sideRenderer
    } = props;

    // State
    const [items, setItems] = React.useState<D[]>([]);

    // Drag end handler
    const onDragEnd = (result: DropResult) => {
        console.log(result);
        // Dropped outside the list
        if (!result.destination) {
            return;
        }

        // Clone
        const newItems = [...items];

        // Removed item
        const [removed] = newItems.splice(result.source.index, 1);

        // Insert to the destination index
        newItems.splice(result.destination.index, 0, removed);

        // Update the state
        setItems(newItems);
    };

    // Add handler
    const onAdd = (newItem: D) => {
        // Existence check
        if (items.some((item) => item[labelField] == newItem[labelField])) {
            return false;
        }

        // Clone
        const newItems = [newItem, ...items];

        // Update the state
        setItems(newItems);

        return true;
    };

    // Delete handler
    const onDelete = (index: number) => {
        // Clone
        const newItems = [...items];

        // Remove the item
        newItems.splice(index, 1);

        // Update the state
        setItems(newItems);
    };

    React.useEffect(() => {
        loadData(name).then((items) => setItems(items));
    }, [name]);

    // Layout
    return (
        <React.Fragment>
            {sideRenderer && sideRenderer(true, onAdd)}
            <Component {...componentProps}>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId={name}>
                        {(provided, snapshot) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={getListStyle(snapshot.isDraggingOver)}
                            >
                                {items.map((item, index) => {
                                    // Id
                                    const id = DataTypes.convert(
                                        item[labelField],
                                        'string'
                                    );
                                    if (id == null) return;

                                    return (
                                        <Draggable
                                            key={id}
                                            draggableId={id}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{
                                                        ...getItemStyle(
                                                            snapshot.isDragging
                                                        ),
                                                        ...provided
                                                            .draggableProps
                                                            .style
                                                    }}
                                                >
                                                    {children(
                                                        item,
                                                        index,
                                                        onDelete
                                                    )}
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </Component>
            {sideRenderer && sideRenderer(false, onAdd)}
        </React.Fragment>
    );
}
